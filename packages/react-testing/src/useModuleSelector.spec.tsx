import { SimpluxModuleSelectorHookWithExtras } from '@simplux/react'
import { cleanup, render } from '@testing-library/react'
import { default as React, useCallback } from 'react'
import {
  createSelectorHookWithTestingExtras,
  mockSelectorHookState,
  mockSelectorHookStateForNextRender,
  removeAllSelectorHookMockStates,
  removeSelectorHookMockState,
} from './useModuleSelector'

describe(createSelectorHookWithTestingExtras.name, () => {
  const moduleState = { count: 0 }
  let originalSelectorHookMock: jest.Mock

  let useSelector: SimpluxModuleSelectorHookWithExtras<typeof moduleState>

  beforeEach(() => {
    originalSelectorHookMock = jest
      .fn()
      .mockImplementation(selector => selector(moduleState))

    useSelector = createSelectorHookWithTestingExtras(
      'testingModule',
      originalSelectorHookMock as any,
    )

    useSelector.moduleName = 'testingModule'
  })

  afterEach(() => {
    cleanup()
    removeAllSelectorHookMockStates()
  })

  describe('returned selector hook', () => {
    it('calls the original hook', () => {
      const renderedItems: number[] = []

      const Comp = () => {
        const selector = useCallback(
          ({ count }: typeof moduleState) => count + 1,
          [],
        )
        const value = useSelector(selector)
        renderedItems.push(value)
        return <div />
      }

      render(<Comp />)

      expect(originalSelectorHookMock).toHaveBeenCalled()
      expect(renderedItems).toEqual([1])
    })

    it('allows state to be mocked', () => {
      const renderedItems: number[] = []

      const Comp = () => {
        const selector = useCallback(
          ({ count }: typeof moduleState) => count + 1,
          [],
        )
        const value = useSelector(selector)
        renderedItems.push(value)
        return <div />
      }

      mockSelectorHookState(useSelector, { count: 10 })

      render(<Comp />)
      render(<Comp />)
      render(<Comp />)

      expect(renderedItems).toEqual([11, 11, 11])
    })

    it('can be mocked for the next render', () => {
      const renderedItems: number[] = []

      const Comp = () => {
        const selector = useCallback(
          ({ count }: typeof moduleState) => count + 1,
          [],
        )
        const value = useSelector(selector)
        renderedItems.push(value)
        return <div />
      }

      mockSelectorHookStateForNextRender(useSelector, { count: 10 })

      render(<Comp />)

      render(<Comp />)

      expect(renderedItems).toEqual([11, 1])
    })

    it('can be mocked for the next render with nested components', () => {
      const renderedItems: number[] = []

      const Parent = () => {
        const selector = useCallback(
          ({ count }: typeof moduleState) => count + 2,
          [],
        )
        const value = useSelector(selector)
        renderedItems.push(value)
        return <Child />
      }

      const Child = () => {
        const selector = useCallback(
          ({ count }: typeof moduleState) => count + 1,
          [],
        )
        const value = useSelector(selector)
        renderedItems.push(value)
        return <div />
      }

      mockSelectorHookStateForNextRender(useSelector, { count: 10 })

      render(<Parent />)

      render(<Parent />)

      expect(renderedItems).toEqual([12, 11, 2, 1])
    })

    describe('mocks', () => {
      it('can be removed', () => {
        const renderedItems: number[] = []

        const Comp = () => {
          const selector = useCallback(
            ({ count }: typeof moduleState) => count + 1,
            [],
          )
          const value = useSelector(selector)
          renderedItems.push(value)
          return <div />
        }

        mockSelectorHookState(useSelector, { count: 10 })

        render(<Comp />)
        render(<Comp />)

        removeSelectorHookMockState(useSelector)

        render(<Comp />)

        expect(renderedItems).toEqual([11, 11, 1])
      })

      it('can be removed all at once', () => {
        const originalSelectorHookMock2 = jest
          .fn()
          .mockImplementation(selector => selector(moduleState))

        const useSelector2 = createSelectorHookWithTestingExtras<
          typeof moduleState
        >('testingModule2', originalSelectorHookMock2 as any)

        useSelector2.moduleName = 'testingModule2'

        const renderedItems: number[] = []

        const Comp = () => {
          const selector = useCallback(
            ({ count }: typeof moduleState) => count + 1,
            [],
          )
          const value = useSelector(selector)
          const value2 = useSelector2(selector)
          renderedItems.push(value, value2)
          return <div />
        }

        mockSelectorHookState(useSelector, { count: 10 })
        mockSelectorHookState(useSelector2, { count: 20 })

        render(<Comp />)
        render(<Comp />)

        removeAllSelectorHookMockStates()

        render(<Comp />)

        expect(renderedItems).toEqual([11, 21, 11, 21, 1, 1])
      })
    })
  })
})

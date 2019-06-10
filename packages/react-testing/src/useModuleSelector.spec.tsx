import { SimpluxModuleSelectorHookWithExtras } from '@simplux/react'
import { default as React, useCallback } from 'react'
import { cleanup, render } from 'react-testing-library'
import { createSelectorHookWithTestingExtras } from './useModuleSelector'

describe(createSelectorHookWithTestingExtras.name, () => {
  const moduleState = { count: 0 }
  let originalSelectorHookMock: jest.Mock

  let useSelector: SimpluxModuleSelectorHookWithExtras<typeof moduleState>

  beforeEach(() => {
    originalSelectorHookMock = jest
      .fn()
      .mockImplementation(selector => selector(moduleState))

    useSelector = createSelectorHookWithTestingExtras(
      originalSelectorHookMock as any,
      {},
    )
  })

  afterEach(cleanup)

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

      useSelector.mockState({ count: 10 })

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

      useSelector.mockStateForNextRender({ count: 10 })

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

      useSelector.mockStateForNextRender({ count: 10 })

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

        useSelector.mockState({ count: 10 })

        render(<Comp />)
        render(<Comp />)

        useSelector.removeMockState()

        render(<Comp />)

        expect(renderedItems).toEqual([11, 11, 1])
      })
    })
  })
})

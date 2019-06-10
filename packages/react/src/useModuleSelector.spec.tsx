import { default as React, useCallback, useReducer } from 'react'
import { act as actHook, renderHook } from 'react-hooks-testing-library'
import { act, cleanup, render } from 'react-testing-library'
import { createSelectorHook, useModuleSelector } from './useModuleSelector'
import { getWindow } from './window'

jest.mock('./window', () => ({
  getWindow: jest.fn().mockImplementation(() => window),
}))

describe(useModuleSelector.name, () => {
  let moduleState = { count: 0 }
  let subscriber: (state: typeof moduleState) => void = () => void 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)

  let unsubscribeMock: jest.Mock
  let subscribeToModuleStateChangesMock: jest.Mock

  let useSelector: <TSelected>(
    selector: (state: typeof moduleState) => TSelected,
  ) => TSelected

  beforeEach(() => {
    moduleState = { count: 0 }

    unsubscribeMock = jest.fn()
    subscribeToModuleStateChangesMock = jest.fn().mockImplementation(s => {
      subscriber = s
      return unsubscribeMock
    })

    useSelector = selector =>
      useModuleSelector<typeof moduleState, ReturnType<typeof selector>>(
        getModuleStateMock,
        subscribeToModuleStateChangesMock,
        selector,
      )
  })

  afterEach(cleanup)

  describe('core subscription behavior', () => {
    it('selects the module state on initial render', () => {
      const { result } = renderHook(() => useSelector(s => s.count))

      expect(result.current).toEqual(0)
    })

    it('selects the state and renders the component when the store updates', () => {
      const { result } = renderHook(() => useSelector(s => s.count))

      expect(result.current).toEqual(0)

      actHook(() => {
        moduleState = { count: 1 }
        subscriber(moduleState)
      })

      expect(result.current).toEqual(1)
    })
  })

  describe('lifeycle interactions', () => {
    it('always uses the latest state', () => {
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

      expect(renderedItems).toEqual([1])

      act(() => {
        moduleState = { count: 1 }
        subscriber(moduleState)
      })

      expect(renderedItems).toEqual([1, 2])
    })

    it('unsubscribes when the component is unmounted', () => {
      const Parent = () => {
        const count = useSelector(s => s.count)
        return count === 0 ? <Child /> : null
      }

      const Child = () => {
        const count = useSelector(s => s.count)
        return <div>{count}</div>
      }

      render(<Parent />)

      expect(unsubscribeMock).not.toHaveBeenCalled()

      act(() => {
        moduleState = { count: 1 }
        subscriber(moduleState)
      })

      expect(unsubscribeMock).toHaveBeenCalled()
    })

    it('notices store updates between render and store subscription effect', () => {
      const renderedItems: number[] = []

      const Comp = () => {
        const count = useSelector(s => s.count)
        renderedItems.push(count)

        // I don't know a better way to trigger a store update before the
        // store subscription effect happens
        if (count === 0) {
          moduleState = { count: 1 }
          subscriber(moduleState)
        }

        return <div>{count}</div>
      }

      render(<Comp />)

      expect(renderedItems).toEqual([0, 1])
    })
  })

  describe('performance optimizations and bail-outs', () => {
    it('defaults to ref-equality to prevent unnecessary updates', () => {
      const renderedItems = []

      const Comp = () => {
        const value = useSelector(s => s)
        renderedItems.push(value)
        return <div />
      }

      render(<Comp />)

      expect(renderedItems.length).toBe(1)

      act(() => {
        subscriber(moduleState)
      })

      expect(renderedItems.length).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('ignores transient errors in selector (e.g. due to stale props)', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const Parent = () => {
        const count = useSelector(s => s.count)
        return <Child parentCount={count} />
      }

      const Child = ({ parentCount }: { parentCount: number }) => {
        const result = useSelector(({ count }) => {
          if (count !== parentCount) {
            throw new Error()
          }

          return count + parentCount
        })

        return <div>{result}</div>
      }

      render(<Parent />)

      expect(() => {
        act(() => {
          moduleState = { count: 1 }
          subscriber(moduleState)
        })
      }).not.toThrowError()

      spy.mockRestore()
    })

    it('re-throws errors in selector', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

      const Comp = () => {
        const result = useSelector(({ count }) => {
          if (count > 0) {
            throw new Error()
          }

          return count
        })

        return <div>{result}</div>
      }

      render(<Comp />)

      expect(() => {
        act(() => {
          moduleState = { count: 1 }
          subscriber(moduleState)
        })
      }).toThrowError()

      spy.mockRestore()
    })

    it('uses the latest selector', () => {
      const renderedItems: number[] = []
      let selectorId = 0
      let forceRender: () => void = undefined!

      const Comp = () => {
        const [, f] = useReducer((c: number) => c + 1, 0)
        forceRender = f as any
        const renderedSelectorId = selectorId++
        const value = useSelector(() => renderedSelectorId)
        renderedItems.push(value)
        return <div />
      }

      render(<Comp />)

      expect(renderedItems).toEqual([0])

      act(forceRender)
      expect(renderedItems).toEqual([0, 1])

      act(() => {
        moduleState = { count: 1 }
        subscriber(moduleState)
      })
      expect(renderedItems).toEqual([0, 1])

      act(forceRender)
      expect(renderedItems).toEqual([0, 1, 2])
    })

    it('uses the correct effect hook if window is not defined', () => {
      (getWindow as jest.Mock).mockImplementation(() => undefined)

      expect(() =>
        renderHook(() => useSelector(s => s.count)),
      ).not.toThrowError()
    })
  })

  describe('hook factory', () => {
    it('works', () => {
      moduleState = { count: 10 }

      const useSelector = createSelectorHook(
        getModuleStateMock,
        subscribeToModuleStateChangesMock,
      )

      const { result } = renderHook(() => useSelector(s => s.count))

      expect(result.current).toBe(10)
    })
  })
})

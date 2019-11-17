import { SimpluxModule, StateChangeSubscription } from '@simplux/core'
import { act, cleanup, render } from '@testing-library/react'
import { default as React, useCallback, useReducer } from 'react'
import { act as actHook, renderHook } from 'react-hooks-testing-library'
import {
  createSelectorHook,
  SimpluxModuleSelectorHookInternals,
  useModuleSelector,
} from './useModuleSelector'
import { getWindow } from './window'

jest.mock('./window', () => ({
  getWindow: jest.fn().mockImplementation(() => window),
}))

describe(useModuleSelector.name, () => {
  let moduleState = { count: 0 }
  let subscriber: (state: typeof moduleState) => void = () => void 0
  let getModuleStateMock: jest.Mock<typeof moduleState, []>
  const setModuleStateMock = jest.fn()

  let subscriptionMock: StateChangeSubscription<any, any>
  let subscribeToModuleStateChangesMock: jest.Mock

  let useSelector: <TSelected>(
    selector: (state: typeof moduleState) => TSelected,
  ) => TSelected

  let moduleMock: SimpluxModule<typeof moduleState>

  beforeEach(() => {
    moduleState = { count: 0 }
    subscriptionMock = {
      unsubscribe: jest.fn(),
      handler: () => void 0,
    }
    getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    subscribeToModuleStateChangesMock = jest.fn().mockImplementation(s => {
      subscriber = s
      subscriber(moduleState)
      return subscriptionMock
    })

    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simpluxInternals: {
        name: 'test',
        mockStateValue: undefined,
        mutations: {},
        mutationMocks: {},
        selectors: {},
        dispatch: undefined!,
        getReducer: undefined!,
      },
    }

    jest.clearAllMocks()
  })

  beforeEach(() => {
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

      expect(subscriptionMock.unsubscribe).not.toHaveBeenCalled()

      act(() => {
        moduleState = { count: 1 }
        subscriber(moduleState)
      })

      expect(subscriptionMock.unsubscribe).toHaveBeenCalled()
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

  describe('mocking', () => {
    it('selects the mocked module state if set', () => {
      const useSelector = createSelectorHook(moduleMock)

      getModuleStateMock.mockReturnValue({ count: 11 })

      const { result } = renderHook(() => useSelector(s => s.count))

      expect(result.current).toEqual(11)
    })

    it('selects the mock when subscriber is called', () => {
      const useSelector = createSelectorHook(moduleMock)

      getModuleStateMock.mockReturnValue({ count: 11 })

      const { result } = renderHook(() => useSelector(s => s.count))

      expect(result.current).toEqual(11)

      getModuleStateMock.mockReturnValue({ count: 12 })

      actHook(() => {
        subscriber({ count: 1 })
      })

      expect(result.current).toEqual(12)
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
      const getWindowMock = getWindow as jest.Mock
      getWindowMock.mockImplementation(() => undefined)

      expect(() =>
        renderHook(() => useSelector(s => s.count)),
      ).not.toThrowError()
    })
  })

  describe('hook factory', () => {
    it('works', () => {
      moduleState = { count: 10 }

      const useSelector = createSelectorHook(moduleMock)

      const { result } = renderHook(() => useSelector(s => s.count))

      expect(result.current).toBe(10)
    })

    it('adds the module name to the hook', () => {
      const useSelector = createSelectorHook(moduleMock)

      expect(useSelector.moduleName).toBe(moduleMock.$simpluxInternals.name)
    })

    it('adds the owning module to the hook', () => {
      const useSelector = createSelectorHook(moduleMock)

      expect(
        ((useSelector as unknown) as SimpluxModuleSelectorHookInternals<
          typeof moduleState
        >).owningModule,
      ).toBe(moduleMock)
    })
  })
})

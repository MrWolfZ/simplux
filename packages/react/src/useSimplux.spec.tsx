import {
  createSelectors,
  setReduxStoreForSimplux,
  SimpluxModule,
  SimpluxSelector,
  SIMPLUX_MODULE,
  StateChangeSubscription,
} from '@simplux/core'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { act as actHook, renderHook } from '@testing-library/react-hooks'
import React, { useLayoutEffect, useState } from 'react'
import {
  act as rendererAct,
  create as rendererCreate,
  ReactTestRenderer,
} from 'react-test-renderer'
import type { Store } from 'redux'
import { SimpluxProvider } from './context'
import { useSimplux } from './useSimplux'

describe(useSimplux.name, () => {
  let renderer: ReactTestRenderer

  let moduleState = { count: 0 }
  let subscriber: (state: typeof moduleState) => void = () => {}
  let getModuleStateMock: jest.Mock<typeof moduleState, []>

  let subscriptionMock: StateChangeSubscription<any, any>
  let subscribeToModuleStateChangesMock: jest.Mock

  let moduleMock: Mutable<SimpluxModule<typeof moduleState>>

  let storeMock: Store
  let subscribeToStoreMock: jest.Mock

  function createSelector<TArgs extends any[], TResult>(
    fn: (state: typeof moduleState, ...args: TArgs) => TResult,
  ): SimpluxSelector<typeof moduleState, TArgs, TResult> {
    return createSelectors(moduleMock, {
      selector: fn,
    }).selector
  }

  const create: typeof rendererCreate = (...args) => {
    rendererAct(() => {
      renderer = rendererCreate(...args)
    })

    return renderer!
  }

  beforeEach(() => {
    moduleState = { count: 10 }

    subscriptionMock = {
      unsubscribe: jest.fn(),
      handler: () => void 0,
    }

    subscriber = () => {}
    getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    subscribeToModuleStateChangesMock = jest.fn().mockImplementation((s) => {
      subscriber = s
      subscriber(getModuleStateMock())
      return subscriptionMock
    })

    moduleMock = {
      state: undefined!,
      setState: undefined!,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simplux: {
        name: 'test',
        mutations: {},
        dispatch: undefined!,
        getReducer: undefined!,
        getState: getModuleStateMock,
      },
      [SIMPLUX_MODULE]: '' as any,
    }

    moduleMock.state = createSelector((s) => s)

    subscribeToStoreMock = jest.fn().mockImplementation((handler) => {
      subscriber = (s) => {
        moduleState = s
        handler()
      }

      subscriber(getModuleStateMock())
      return () => {
        subscriber = () => {}
      }
    })

    storeMock = {
      dispatch: undefined!,
      getState: getModuleStateMock,
      replaceReducer: undefined!,
      subscribe: subscribeToStoreMock,
      [Symbol.observable]: undefined!,
    }

    setReduxStoreForSimplux(storeMock, (s) => s)

    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    renderer?.unmount()
  })

  it('selects the module state on initial render', () => {
    const selector = createSelector((s) => s.count)
    const { result } = renderHook(() => useSimplux(selector))
    expect(result.current).toEqual(10)
  })

  it('selects the module state with args on initial render', () => {
    const selector = createSelector((s, amount: number) => s.count + amount)
    const { result } = renderHook(() => useSimplux(selector, 5))
    expect(result.current).toEqual(15)
  })

  it('selects the state and renders the component when the store updates', () => {
    const selector = createSelector((s) => s.count)
    const { result } = renderHook(() => useSimplux(selector))

    expect(result.current).toEqual(10)

    actHook(() => {
      moduleState = { count: 11 }
      subscriber(moduleState)
    })

    expect(result.current).toEqual(11)
  })

  it('selects the state and renders the component with args when the store updates', () => {
    const selector = createSelector((s, amount: number) => s.count + amount)
    const { result } = renderHook(() => useSimplux(selector, 5))

    expect(result.current).toEqual(15)

    actHook(() => {
      moduleState = { count: 11 }
      subscriber(moduleState)
    })

    expect(result.current).toEqual(16)
  })

  describe('with module', () => {
    it('selects the module state on initial render', () => {
      const { result } = renderHook(() => useSimplux(moduleMock))
      expect(result.current).toEqual(moduleState)
    })

    it('selects the state and renders the component when the store updates', () => {
      const { result } = renderHook(() => useSimplux(moduleMock))

      expect(result.current).toEqual(moduleState)

      actHook(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      expect(result.current).toEqual(moduleState)
    })
  })

  describe('with provider', () => {
    it('selects the module state on initial render', () => {
      const renderedItems: number[] = []
      const selector = createSelector((s) => s.count)

      const Comp = () => {
        const count = useSimplux(selector)
        renderedItems.push(count)
        return <div>{count}</div>
      }

      create(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([10])
    })

    it('selects the module state with args on initial render', () => {
      const renderedItems: number[] = []
      const selector = createSelector((s, amount: number) => s.count + amount)

      const Comp = () => {
        const count = useSimplux(selector, 5)
        renderedItems.push(count)
        return <div>{count}</div>
      }

      create(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([15])
    })

    it('selects the state and renders the component when the store updates', () => {
      const renderedItems: number[] = []
      const selector = createSelector((s) => s.count)

      const Comp = () => {
        const count = useSimplux(selector)
        renderedItems.push(count)
        return <div>{count}</div>
      }

      create(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([10])

      rendererAct(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      expect(renderedItems).toEqual([10, 11])
    })

    it('selects the state and renders the component with args when the store updates', () => {
      const renderedItems: number[] = []
      const selector = createSelector((s, amount: number) => s.count + amount)

      const Comp = () => {
        const count = useSimplux(selector, 5)
        renderedItems.push(count)
        return <div>{count}</div>
      }

      create(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([15])

      rendererAct(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      expect(renderedItems).toEqual([15, 16])
    })
  })

  describe('lifeycle interactions', () => {
    it('subscribes when the component is mounted', () => {
      const selector = createSelector((s) => s.count)

      const Comp = () => {
        const count = useSimplux(selector)
        return <div>{count}</div>
      }

      render(<Comp />)

      expect(subscribeToModuleStateChangesMock).toHaveBeenCalledTimes(1)
    })

    it('unsubscribes when the component is unmounted', () => {
      const selector = createSelector((s) => s.count)

      const Parent = () => {
        const count = useSimplux(selector)
        return count === 10 ? <Child /> : null
      }

      const Child = () => {
        const count = useSimplux(selector)
        return <div>{count}</div>
      }

      render(<Parent />)

      expect(subscriptionMock.unsubscribe).not.toHaveBeenCalled()

      act(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      expect(subscriptionMock.unsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('performance', () => {
    it('does not cause a re-render initially', () => {
      let renderCount = 0
      const selector = createSelector((s) => s)

      const Comp = () => {
        useSimplux(selector)
        renderCount += 1
        return <div />
      }

      render(<Comp />)

      expect(renderCount).toBe(1)
    })

    it('does not re-render if the selected state does not change (based on ref equality)', () => {
      let renderCount = 0
      const selector = createSelector((s) => s)

      const Comp = () => {
        useSimplux(selector)
        renderCount += 1
        return <div />
      }

      render(<Comp />)

      expect(renderCount).toBe(1)

      act(() => {
        subscriber(moduleState)
      })

      expect(renderCount).toBe(1)
    })

    it('renders once on state update', () => {
      let renderCount = 0
      const selector = createSelector((s) => s)

      const Comp = () => {
        useSimplux(selector)
        renderCount += 1
        return <div />
      }

      render(<Comp />)

      renderCount = 0

      act(() => {
        getModuleStateMock.mockReturnValue({ count: moduleState.count + 1 })
        subscriber(getModuleStateMock())
      })

      expect(renderCount).toBe(1)
    })

    it('renders once on selector update', () => {
      let renderCount = 0
      const selector1 = createSelector((s) => s.count)
      const selector2 = createSelector((s) => s.count * 2)

      const Parent = () => {
        const [useFirst, set] = useState(true)

        return (
          <>
            <button id='btn' onClick={() => set(false)} />
            <Child useFirst={useFirst} />
          </>
        )
      }

      const Child = ({ useFirst }: { useFirst: boolean }) => {
        useSimplux(useFirst ? selector1 : selector2)
        renderCount += 1
        return <div />
      }

      const { container } = render(<Parent />)

      renderCount = 0

      act(() => {
        fireEvent.click(container.querySelector('#btn')!)
      })

      expect(renderCount).toBe(1)
    })

    it('renders once on arg update', () => {
      let renderCount = 0
      const selector = createSelector(
        (s, arg: boolean) => s.count + (arg ? 1 : 0),
      )

      const Parent = () => {
        const [arg, set] = useState(false)

        return (
          <>
            <button id='btn' onClick={() => set(true)} />
            <Child arg={arg} />
          </>
        )
      }

      const Child = ({ arg }: { arg: boolean }) => {
        useSimplux(selector, arg)
        renderCount += 1
        return <div />
      }

      const { container } = render(<Parent />)

      renderCount = 0

      act(() => {
        fireEvent.click(container.querySelector('#btn')!)
      })

      expect(renderCount).toBe(1)
    })

    it('memoizes the selector result', () => {
      let renderCount = 0
      let selectorCallCount = 0
      const selector = createSelector(() => {
        selectorCallCount += 1
        return {}
      })

      const Comp = () => {
        useSimplux(selector)
        renderCount += 1
        return <div />
      }

      render(<Comp />)

      renderCount = 0

      act(() => {
        subscriber(getModuleStateMock())
      })

      expect(selectorCallCount).toBe(1)
      expect(renderCount).toBe(0)
    })
  })

  describe('mocking', () => {
    it('selects the mocked module state if set', () => {
      const selector = createSelector((s) => s.count)

      getModuleStateMock.mockReturnValue({ count: 11 })

      const { result } = renderHook(() => useSimplux(selector))

      expect(result.current).toEqual(11)
    })

    it('calls the mocked selector if set', () => {
      const selector = createSelector((s) => s.count)

      const mock = jest.fn().mockReturnValueOnce(-1)
      moduleMock.$simplux.selectorMocks = {
        [selector.selectorId]: mock,
      }

      const { result } = renderHook(() => useSimplux(selector))

      expect(result.current).toEqual(-1)
    })

    it('selects the mock when subscriber is called', () => {
      const selector = createSelector((s) => s.count)

      getModuleStateMock.mockReturnValue({ count: 11 })

      const { result } = renderHook(() => useSimplux(selector))

      expect(result.current).toEqual(11)

      getModuleStateMock.mockReturnValue({ count: 12 })

      actHook(() => {
        subscriber({ count: 1 })
      })

      expect(result.current).toEqual(12)
    })
  })

  describe('edge cases', () => {
    it('notices store updates between render and store subscription effect', () => {
      const renderedItems: number[] = []
      const selector = createSelector((s) => s.count)

      const Comp = () => {
        const count = useSimplux(selector)
        renderedItems.push(count)

        // a layout effect runs before the subscription effect
        useLayoutEffect(() => {
          if (count === 11) {
            moduleState = { count: 12 }
            subscriber(moduleState)
          }
        })

        return <div>{count}</div>
      }

      render(<Comp />)

      act(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      expect(renderedItems).toEqual([10, 11, 12])
    })

    it('works correctly is selector changes', () => {
      const renderedItems: number[] = []
      const selector1 = createSelector((s) => s.count)
      const selector2 = createSelector((s) => s.count * 2)

      const Parent = () => {
        const [useFirst, set] = useState(true)

        return (
          <>
            <button id='btn' onClick={() => set(false)} />
            <Child useFirst={useFirst} />
          </>
        )
      }

      const Child = ({ useFirst }: { useFirst: boolean }) => {
        const value = useSimplux(useFirst ? selector1 : selector2)
        renderedItems.push(value)
        return <div />
      }

      const { container } = render(<Parent />)

      act(() => {
        fireEvent.click(container.querySelector('#btn')!)
      })

      expect(renderedItems).toEqual([10, 20])
    })

    it('works correctly is args change', () => {
      const renderedItems: number[] = []
      const selector = createSelector((s, amount: number) => s.count + amount)

      const Parent = () => {
        const [amount, set] = useState(5)

        return (
          <>
            <button id='btn' onClick={() => set(10)} />
            <Child amount={amount} />
          </>
        )
      }

      const Child = ({ amount }: { amount: number }) => {
        const value = useSimplux(selector, amount)
        renderedItems.push(value)
        return <div />
      }

      const { container } = render(<Parent />)

      act(() => {
        fireEvent.click(container.querySelector('#btn')!)
      })

      expect(renderedItems).toEqual([15, 20])
    })

    it('ignores transient errors in selector (e.g. due to stale props)', () => {
      const selector = createSelector((s) => s.count)
      const consistencyCheckSelector = createSelector(
        ({ count }, parentCount: number) => {
          if (count !== parentCount) {
            throw new Error()
          }

          return count + parentCount
        },
      )

      const Parent = () => {
        const count = useSimplux(selector)
        return <Child parentCount={count} />
      }

      const Child = ({ parentCount }: { parentCount: number }) => {
        const result = useSimplux(consistencyCheckSelector, parentCount)
        return <div>{result}</div>
      }

      render(<Parent />)

      expect(() => {
        act(() => {
          moduleState = { count: 11 }
          subscriber(moduleState)
        })
      }).not.toThrowError()
    })

    it('re-throws errors in selector', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const selector = createSelector(({ count }) => {
        if (count > 10) {
          throw new Error()
        }

        return count
      })

      const Comp = () => {
        const result = useSimplux(selector)
        return <div>{result}</div>
      }

      render(<Comp />)

      expect(() => {
        act(() => {
          moduleState = { count: 11 }
          subscriber(moduleState)
        })
      }).toThrowError()

      spy.mockRestore()
    })

    it('correctly handles updates after transient error', () => {
      let hasThrown = false
      const renderedItems: number[] = []

      const selector = createSelector(({ count }) => {
        if (count > 10 && !hasThrown) {
          hasThrown = true
          throw new Error()
        }

        return count
      })

      const Comp = () => {
        const result = useSimplux(selector)
        renderedItems.push(result)
        return <div>{result}</div>
      }

      render(<Comp />)

      act(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      act(() => {
        moduleState = { count: 10 }
        subscriber(moduleState)
      })

      expect(renderedItems).toEqual([10, 11, 10])
    })
  })
})

type Mutable<T> = { -readonly [prop in keyof T]: T[prop] }

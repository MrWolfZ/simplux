import {
  SimpluxModule,
  SimpluxSelector,
  StateChangeSubscription,
} from '@simplux/core'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import React, { useLayoutEffect, useState } from 'react'
import { act as actHook, renderHook } from 'react-hooks-testing-library'
import { create } from 'react-test-renderer'
import { SimpluxProvider } from './context'
import { useSimplux } from './useSimplux'

describe(useSimplux.name, () => {
  let moduleState = { count: 0 }
  let subscriber: (state: typeof moduleState) => void = () => void 0
  let getModuleStateMock: jest.Mock<typeof moduleState, []>

  let subscriptionMock: StateChangeSubscription<any, any>
  let subscribeToModuleStateChangesMock: jest.Mock

  let moduleMock: SimpluxModule<typeof moduleState>

  function createSelector<TArgs extends any[], TResult>(
    fn: (state: typeof moduleState, ...args: TArgs) => TResult,
  ): SimpluxSelector<typeof moduleState, TArgs, TResult> {
    const selector = (...args: TArgs) => fn(getModuleStateMock(), ...args)

    const mutableSelector = (selector as unknown) as Mutable<
      SimpluxSelector<typeof moduleState, TArgs, TResult>
    >

    mutableSelector.owningModule = moduleMock
    mutableSelector.withState = fn

    return mutableSelector as any
  }

  beforeEach(() => {
    moduleState = { count: 10 }

    subscriptionMock = {
      unsubscribe: jest.fn(),
      handler: () => void 0,
    }

    getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    subscribeToModuleStateChangesMock = jest.fn().mockImplementation(s => {
      subscriber = s
      subscriber(getModuleStateMock())
      return subscriptionMock
    })

    moduleMock = {
      getState: getModuleStateMock,
      setState: undefined!,
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

  afterEach(cleanup)

  it('selects the module state on initial render', () => {
    const selector = createSelector(s => s.count)
    const { result } = renderHook(() => useSimplux(selector))
    expect(result.current).toEqual(10)
  })

  it('selects the module state with args on initial render', () => {
    const selector = createSelector((s, amount: number) => s.count + amount)
    const { result } = renderHook(() => useSimplux(selector, 5))
    expect(result.current).toEqual(15)
  })

  it('selects the state and renders the component when the store updates', () => {
    const selector = createSelector(s => s.count)
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

  describe('with provider', () => {
    it('selects the module state on initial render', () => {
      const renderedItems: number[] = []
      const selector = createSelector(s => s.count)

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
      const selector = createSelector(s => s.count)

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

      actHook(() => {
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

      actHook(() => {
        moduleState = { count: 11 }
        subscriber(moduleState)
      })

      expect(renderedItems).toEqual([15, 16])
    })
  })

  describe('lifeycle interactions', () => {
    it('subscribes when the component is mounted', () => {
      const selector = createSelector(s => s.count)

      const Comp = () => {
        const count = useSimplux(selector)
        return <div>{count}</div>
      }

      render(<Comp />)

      expect(subscribeToModuleStateChangesMock).toHaveBeenCalledTimes(1)
    })

    it('unsubscribes when the component is unmounted', () => {
      const selector = createSelector(s => s.count)

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

      // it is called twice since the update itself causes a resubscribe
      // of the child before it is unmounted
      expect(subscriptionMock.unsubscribe).toHaveBeenCalledTimes(2)
    })
  })

  describe('performance', () => {
    it('does not cause a re-render initially', () => {
      let renderCount = 0
      const selector = createSelector(s => s)

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
      const selector = createSelector(s => s)

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
      const selector = createSelector(s => s)

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
      const selector1 = createSelector(s => s.count)
      const selector2 = createSelector(s => s.count * 2)

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
      const selector = createSelector(s => s.count)

      getModuleStateMock.mockReturnValue({ count: 11 })

      const { result } = renderHook(() => useSimplux(selector))

      expect(result.current).toEqual(11)
    })

    it('selects the mock when subscriber is called', () => {
      const selector = createSelector(s => s.count)

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
      const selector = createSelector(s => s.count)

      const Comp = () => {
        const count = useSimplux(selector)
        renderedItems.push(count)

        // a layout effect runs before the subscription effect
        useLayoutEffect(() => {
          if (count === 10) {
            moduleState = { count: 11 }
            subscriber(moduleState)
          }
        })

        return <div>{count}</div>
      }

      create(<Comp />)

      expect(renderedItems).toEqual([10, 11])
    })

    it('works correctly is selector changes', () => {
      const renderedItems: number[] = []
      const selector1 = createSelector(s => s.count)
      const selector2 = createSelector(s => s.count * 2)

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
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const selector = createSelector(s => s.count)
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

      spy.mockRestore()
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
  })
})

type Mutable<T> = { -readonly [prop in keyof T]: T[prop] }
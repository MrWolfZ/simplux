import { getSimpluxStore } from '@simplux/core'
import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { shallowEquals } from './util/shallowEquals'

// TODO: wrap store with proxy that notifies subscribers using batching (or just
// switch to react-redux or another existing react bindings implementation)

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed
const useIsomorphicLayoutEffect =
  // tslint:disable-next-line: strict-type-predicates
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * A hook to access the redux store's state. This hook takes a selector function
 * as an argument. The selector is called with the store state.
 *
 * @param selector the selector function
 *
 * @returns the selected state
 *
 * @example
 *
 * import React from 'react'
 * import { useReduxState } from '@simplux/react'
 * import { RootState } from './store'
 *
 * export const CounterComponent = () => {
 *   const counter = useReduxState((state: RootState) => state.counter, [])
 *   return <div>{counter}</div>
 * }
 */
export function useReduxState<TStoreState = any, TSelected = any>(
  selector: (state: TStoreState) => TSelected,
): TSelected {
  if (!selector) {
    throw new Error(`You must pass a selector to useReduxState`)
  }

  const store = getSimpluxStore()
  const [, forceRender] = useReducer((s: number) => s + 1, 0)

  const latestSubscriptionCallbackError = useRef<Error>()
  const latestSelector = useRef(selector)

  let selectedState: TSelected

  try {
    selectedState = selector(store.getState())
  } catch (err) {
    let errorMessage = `An error occured while selecting the store state: ${
      err.message
    }.`

    if (latestSubscriptionCallbackError.current) {
      errorMessage += `\nThe error may be correlated with this previous error:\n${
        latestSubscriptionCallbackError.current!.stack
      }\n\nOriginal stack trace:`
    }

    throw new Error(errorMessage)
  }

  const latestSelectedState = useRef(selectedState)

  useIsomorphicLayoutEffect(() => {
    latestSelector.current = selector
    latestSelectedState.current = selectedState
    latestSubscriptionCallbackError.current = undefined
  })

  useIsomorphicLayoutEffect(() => {
    function checkForUpdates() {
      try {
        const newSelectedState = latestSelector.current(store.getState())

        if (shallowEquals(newSelectedState, latestSelectedState.current)) {
          return
        }

        latestSelectedState.current = newSelectedState
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        latestSubscriptionCallbackError.current = err
      }

      forceRender({})
    }

    const unsubscribe = store.subscribe(checkForUpdates)
    checkForUpdates()

    return unsubscribe
  }, [store])

  return selectedState
}

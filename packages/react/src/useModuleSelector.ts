import { SubscribeToStateChanges } from '@simplux/core'
import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { getWindow } from './window'

function getEffectHook() {
  // React currently throws a warning when using useLayoutEffect on the server.
  // To get around it, we can conditionally useEffect on the server (no-op) and
  // useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
  // subscription callback always has the selector from the latest render commit
  // available, otherwise a store update may happen between render and the effect,
  // which may cause missed updates
  return typeof getWindow() !== 'undefined' ? useLayoutEffect : useEffect
}

export function useModuleSelector<TState, TSelected>(
  getModuleState: () => TState,
  subscribeToModuleStateChanges: SubscribeToStateChanges<TState>,
  selector: (state: TState) => TSelected,
): TSelected {
  const [, forceRender] = useReducer((s: number) => s + 1, 0)

  const latestSelector = useRef(selector)

  const selectedState = selector(getModuleState())
  const latestSelectedState = useRef(selectedState)

  getEffectHook()(() => {
    latestSelector.current = selector
    latestSelectedState.current = selectedState
  })

  useEffect(() => {
    function checkForUpdates(state: TState) {
      try {
        const newSelectedState = latestSelector.current(state)

        if (newSelectedState === latestSelectedState.current) {
          return
        }

        latestSelectedState.current = newSelectedState
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
      }

      forceRender({})
    }

    const unsubscribe = subscribeToModuleStateChanges(checkForUpdates)
    checkForUpdates(getModuleState())

    return unsubscribe
  }, [])

  return selectedState
}

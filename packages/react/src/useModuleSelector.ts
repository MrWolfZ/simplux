import {
  SimpluxModule,
  SimpluxModuleInternals,
  SubscribeToStateChanges,
} from '@simplux/core'
import { useEffect, useLayoutEffect, useReducer, useRef } from 'react'
import { createBatchedSubscribeFunction } from './subscriptions'
import { getWindow } from './window'

export type SimpluxModuleSelectorHook<TState> = <TResult>(
  selector: (state: TState) => TResult,
) => TResult

/**
 * @private
 */
export interface SimpluxModuleSelectorHookInternals<TState> {
  /**
   * The module this hook belongs to. This is part of the simplux
   * internal API and should not be accessed except by simplux extensions.
   *
   * @private
   */
  owningModule: SimpluxModule<TState>
}

export interface SimpluxModuleSelectorHookExtras {
  /**
   * The name of the module this hook belongs to
   */
  moduleName: string
}

export type SimpluxModuleSelectorHookWithExtras<
  TState
> = SimpluxModuleSelectorHook<TState> & SimpluxModuleSelectorHookExtras

/**
 * Create a react hook that allows accessing the module's state inside
 * a component. The hook takes a selector function that selects some
 * derived state from the module's state.
 *
 * @param simpluxModule the module to create the selector hook for
 *
 * @returns the selector hook
 */
export function createSelectorHook<TState>(
  simpluxModule: SimpluxModule<TState>,
): SimpluxModuleSelectorHookWithExtras<TState> {
  const {
    extensionStateContainer,
  } = (simpluxModule as unknown) as SimpluxModuleInternals

  const subscribe = createBatchedSubscribeFunction(
    simpluxModule.subscribeToStateChanges,
  )

  const getState = () => {
    const mockState = extensionStateContainer.reactSelectorHookStateMock as TState
    if (mockState) {
      return mockState
    }

    return simpluxModule.getState()
  }

  const hook = <TResult = TState>(selector: (state: TState) => TResult) => {
    return useModuleSelector<TState, TResult>(getState, subscribe, selector)
  }

  const hookWithExtras = (hook as unknown) as SimpluxModuleSelectorHookWithExtras<
    TState
  >

  hookWithExtras.moduleName = simpluxModule.name

  const internals = (hookWithExtras as unknown) as SimpluxModuleSelectorHookInternals<
    TState
  >

  internals.owningModule = simpluxModule

  return hookWithExtras
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

    const { unsubscribe } = subscribeToModuleStateChanges(checkForUpdates)
    return unsubscribe
  }, [])

  return selectedState
}

function getEffectHook() {
  // React currently throws a warning when using useLayoutEffect on the server.
  // To get around it, we can conditionally useEffect on the server (no-op) and
  // useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
  // subscription callback always has the selector from the latest render commit
  // available, otherwise a store update may happen between render and the effect,
  // which may cause missed updates
  return typeof getWindow() !== 'undefined' ? useLayoutEffect : useEffect
}

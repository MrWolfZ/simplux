import { AnyAction, Reducer } from 'redux'
import { createModuleReducer, MutationsBase } from './mutations'
import { SimpluxStore, simpluxStore } from './store'

export interface SimpluxModuleConfig<TState> {
  name: string
  initialState: TState
}

export type StateChangeHandler<TState> = (state: TState) => void
export type Unsubscribe = () => void
export type SubscribeToStateChanges<TState> = (
  handler: StateChangeHandler<TState>,
) => Unsubscribe

/**
 * @private
 */
export interface SimpluxModuleExtensionStateContainer {
  [extensionName: string]: unknown
}

/**
 * @private
 */
export interface SimpluxModuleInternals {
  /**
   * This object contains the state for all extensions to this module.
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   *
   * @private
   */
  readonly extensionStateContainer: SimpluxModuleExtensionStateContainer

  /**
   * A proxy to the Redux store's dispatch function. This is part of the
   * simplux internal API and should not be accessed except by simplux
   * extensions.
   *
   * @private
   */
  readonly dispatch: (action: AnyAction) => void

  /**
   * A proxy to the Redux store's dispatch function. This is part of the
   * simplux internal API and should not be accessed except by simplux
   * extensions.
   *
   * @private
   */
  readonly getReducer: () => Reducer
}

export interface SimpluxModule<TState> {
  /**
   * Get the current module state.
   *
   * @returns the module state
   */
  readonly getState: () => TState

  /**
   * Replace the whole module state.
   *
   * @param state the state to set for the module
   */
  readonly setState: (state: TState) => void

  /**
   * Register a handler to be called whenever the module's state
   * changes. The handler will be called immediately with the module's
   * current state when subscribing.
   *
   * @param handler the function to call whenever the module's state changes
   *
   * @returns an unsubscribe function that will remove the handler
   */
  readonly subscribeToStateChanges: SubscribeToStateChanges<TState>

  /**
   * The unique name of the module.
   */
  readonly name: string
}

export function createModule<TState>(
  store: SimpluxStore,
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  const { getState, dispatch, subscribe, setReducer } = store

  const getModuleState = () => getState()[config.name]
  const setModuleState = (state: TState) => {
    dispatch({
      type: `@simplux/${config.name}/setState`,
      state,
    })
  }

  let unsubscribe: (() => void) | undefined
  let latestModuleState = config.initialState
  const handlers: StateChangeHandler<TState>[] = []

  const subscribeToStateChanges = (handler: StateChangeHandler<TState>) => {
    handlers.push(handler)

    if (handlers.length === 1) {
      latestModuleState = getModuleState()
      unsubscribe = subscribe(() => {
        const moduleState = getModuleState()

        if (moduleState !== latestModuleState) {
          latestModuleState = moduleState

          for (const handler of handlers) {
            handler(moduleState)
          }
        }
      })
    }

    handler(latestModuleState)

    return () => {
      const idx = handlers.indexOf(handler)
      if (idx >= 0) {
        handlers.splice(idx, 1)
      }

      if (handlers.length === 0 && unsubscribe) {
        unsubscribe()
        unsubscribe = undefined
      }
    }
  }

  const extensionStateContainer: SimpluxModuleExtensionStateContainer = {}

  const mutationsContainer = (extensionStateContainer.mutations ||
    {}) as MutationsBase<TState>

  extensionStateContainer.mutations = mutationsContainer

  const moduleReducer = createModuleReducer(
    config.name,
    config.initialState,
    mutationsContainer,
  )

  setReducer(config.name, moduleReducer)

  const result: SimpluxModule<TState> & SimpluxModuleInternals = {
    getState: getModuleState,
    setState: setModuleState,
    subscribeToStateChanges,
    name: config.name,
    extensionStateContainer,
    dispatch,
    getReducer: () => simpluxStore.getReducer(config.name),
  }

  return result
}

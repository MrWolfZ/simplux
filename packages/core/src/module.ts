import { AnyAction, Reducer } from 'redux'
import { createImmerReducer } from './immer'
import { MutationListeners } from './mutation-listener'
import { MutationsBase } from './mutations'
import { createModuleReducer } from './reducer'
import { SimpluxStore, simpluxStore } from './store'

export interface SimpluxModuleConfig<TState> {
  name: string
  initialState: TState
}

export type StateChangeHandler<TState> = (
  state: TState,
  previousState: TState,
) => void

// this type exists to get the concrete type of the handler, i.e. to return
// a handler with the correct number or parameters
export type ResolvedStateChangeHandler<TState, THandler> = THandler extends (
  state: TState,
) => void
  ? (state: TState) => void
  : StateChangeHandler<TState>

export interface Subscription<
  TState,
  THandler extends StateChangeHandler<TState>
> {
  unsubscribe: () => void
  handler: ResolvedStateChangeHandler<TState, THandler>
}

export type SubscribeToStateChanges<TState> = <
  THandler extends StateChangeHandler<TState>
>(
  handler: THandler,
) => Subscription<TState, THandler>

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

  const extensionStateContainer: SimpluxModuleExtensionStateContainer = {}

  const getModuleState = (): TState => {
    if (extensionStateContainer.mockStateValue) {
      return extensionStateContainer.mockStateValue as TState
    }

    return getState()[config.name]
  }

  const setModuleState = (state: TState) => {
    dispatch({
      type: `@simplux/${config.name}/setState`,
      state,
    })
  }

  let unsubscribeFromStore: (() => void) | undefined
  let latestModuleState = config.initialState
  const handlers: StateChangeHandler<TState>[] = []

  const subscribeToStateChanges: SubscribeToStateChanges<TState> = handler => {
    handlers.push(handler)

    if (handlers.length === 1) {
      latestModuleState = getModuleState()
      unsubscribeFromStore = subscribe(() => {
        const moduleState = getModuleState()

        if (moduleState !== latestModuleState) {
          const previousModuleState = latestModuleState
          latestModuleState = moduleState

          for (const handler of handlers) {
            handler(moduleState, previousModuleState)
          }
        }
      })
    }

    handler(latestModuleState, latestModuleState)

    const unsubscribe = () => {
      const idx = handlers.indexOf(handler)
      if (idx >= 0) {
        handlers.splice(idx, 1)
      }

      if (handlers.length === 0 && unsubscribeFromStore) {
        unsubscribeFromStore()
        unsubscribeFromStore = undefined
      }
    }

    return {
      unsubscribe,
      handler: (handler as unknown) as ResolvedStateChangeHandler<
        TState,
        typeof handler
      >,
    }
  }

  const mutationsContainer = (extensionStateContainer.mutations ||
    {}) as MutationsBase<TState>

  extensionStateContainer.mutations = mutationsContainer

  const mutationListenersContainer = (extensionStateContainer.mutationListeners ||
    {}) as MutationListeners<TState>

  extensionStateContainer.mutationListeners = mutationListenersContainer

  const moduleReducer = createModuleReducer(
    config.name,
    config.initialState,
    mutationsContainer,
    mutationListenersContainer,
  )

  const moduleReducerWithImmerSupport = createImmerReducer(moduleReducer)

  setReducer(config.name, moduleReducerWithImmerSupport)

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

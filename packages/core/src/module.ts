import { AnyAction, Reducer } from 'redux'
import { createImmerReducer } from './immer'
import { MutationDefinitions } from './mutations'
import { createModuleReducer } from './reducer'
import { SelectorDefinitions } from './selectors'
import { SimpluxStore, simpluxStore } from './store'
import { Immutable } from './types'

export interface SimpluxModuleConfig<TState> {
  name: string
  initialState: TState
}

export type StateChangeHandler<TState> = (
  state: Immutable<TState>,
  previousState: Immutable<TState>,
) => void

export interface StateChangeHandlerOptions {
  shouldSkipInitialInvocation?: boolean
}

// this type exists to get the concrete type of the handler, i.e. to return
// a handler with the correct number or parameters
export type ResolvedStateChangeHandler<TState, THandler> = THandler extends (
  state: Immutable<TState>,
) => void
  ? (state: Immutable<TState>) => void
  : StateChangeHandler<TState>

export interface Subscription {
  unsubscribe: () => void
}

export interface StateChangeSubscription<
  TState,
  THandler extends StateChangeHandler<TState>
> extends Subscription {
  handler: ResolvedStateChangeHandler<TState, THandler>
}

export type SubscribeToStateChanges<TState> = <
  THandler extends StateChangeHandler<TState>
>(
  handler: THandler,
  options?: StateChangeHandlerOptions,
) => StateChangeSubscription<TState, THandler>

/**
 * This is part of the simplux internal API and should not be accessed
 * except by simplux extensions.
 *
 * @private
 */
export interface SimpluxModuleInternals<TState> {
  /**
   * The unique name of the module.
   *
   * @private
   */
  readonly name: string

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   *
   * @private
   */
  mockStateValue: TState | undefined

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   *
   * @private
   */
  readonly mutations: MutationDefinitions<TState>

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   *
   * @private
   */
  readonly mutationMocks: { [mutationName: string]: (...args: any[]) => TState }

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   *
   * @private
   */
  readonly selectors: SelectorDefinitions<TState>

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
  readonly getState: () => Immutable<TState>

  /**
   * Replace the whole module state.
   *
   * @param state the state to set for the module
   */
  readonly setState: (state: Immutable<TState>) => void

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
   * Internal state that is used by simplux. This is part of the simplux
   * internal API and should not be accessed except by simplux extensions.
   *
   * @private
   */
  readonly $simpluxInternals: SimpluxModuleInternals<TState>
}

export function createModule<TState>(
  store: SimpluxStore,
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  if (process.env.NODE_ENV !== 'production') {
    if (!config.name) {
      throw new Error('you must provide a module name!')
    }
  }

  const { getState, dispatch, subscribe, setReducer } = store

  const internals: SimpluxModuleInternals<TState> = {
    name: config.name,
    mockStateValue: undefined,
    mutations: {},
    mutationMocks: {},
    selectors: {},
    dispatch,
    getReducer: () => simpluxStore.getReducer(config.name),
  }

  const getModuleState = (): Immutable<TState> =>
    internals.mockStateValue || getState()[config.name]

  const setModuleState = (state: Immutable<TState>) => {
    dispatch({
      type: `@simplux/${config.name}/setState`,
      state,
    })
  }

  let unsubscribeFromStore: (() => void) | undefined
  let latestModuleState = config.initialState as Immutable<TState>
  const handlers: StateChangeHandler<TState>[] = []

  type Required<T> = { [prop in keyof T]-?: T[prop] }

  const defaultStateChangeHandlerOptions: Required<
    StateChangeHandlerOptions
  > = {
    shouldSkipInitialInvocation: false,
  }

  const subscribeToStateChanges: SubscribeToStateChanges<TState> = (
    handler,
    options = {},
  ) => {
    const fullOptions = {
      ...defaultStateChangeHandlerOptions,
      ...options,
    }

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

    if (!fullOptions.shouldSkipInitialInvocation) {
      handler(latestModuleState, latestModuleState)
    }

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

  const moduleReducer = createModuleReducer(
    config.name,
    config.initialState,
    internals.mutations,
  )

  const moduleReducerWithImmerSupport = createImmerReducer(moduleReducer)

  setReducer(config.name, moduleReducerWithImmerSupport)

  const result: SimpluxModule<TState> = {
    getState: getModuleState,
    setState: setModuleState,
    subscribeToStateChanges,
    $simpluxInternals: internals,
  }

  return result
}

/**
 * Checks if an object is a simplux module.
 *
 * @param object the object to check
 *
 * @returns true if the object is a simplux module
 */
export function isSimpluxModule<TState, TOther>(
  object: SimpluxModule<TState> | TOther,
): object is SimpluxModule<TState> {
  return object && !!(object as SimpluxModule<any>).$simpluxInternals
}

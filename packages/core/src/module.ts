import type { AnyAction, Reducer } from 'redux'
import { createImmerReducer } from './immer.js'
import type { MutationDefinitions } from './mutations.js'
import { createModuleReducer } from './reducer.js'
import { createSelectors, SimpluxSelector } from './selectors.js'
import { simpluxStore, _SimpluxStore } from './store.js'
import type { Immutable } from './types.js'

/**
 * Helper symbol used for identifying simplux module objects.
 *
 * @public
 */
// should really be a symbol, but as of TypeScript 4.1 there is a bug
// that causes the symbol to not be properly re-exported in type
// definitions when spreading a module object onto an export, which can
// cause issues with composite builds
export const SIMPLUX_MODULE = '[SIMPLUX_MODULE]'

/**
 * Configuration object for creating simplux modules.
 *
 * @public
 */
export interface SimpluxModuleConfig<TState> {
  readonly name: string
  readonly initialState: TState
}

/**
 * A function that can be registered in a module to be notified of
 * module state changes.
 *
 * @param state - the current state of the module
 * @param previousState - the previous state of the module
 *
 * @public
 */
export type StateChangeHandler<TState> = (
  state: Immutable<TState>,
  previousState: Immutable<TState>,
) => void

/**
 * Configuration object for registering state change handlers.
 *
 * @public
 */
export interface StateChangeHandlerOptions {
  /**
   * By default a state change handler will be called with the module's
   * current state immediately after being registered. Setting this
   * property to true will skip that invocation and will only call the
   * handler as soon as the state changes.
   *
   * @defaultValue `false`
   */
  readonly shouldSkipInitialInvocation?: boolean
}

/**
 * This type exists to get the concrete type of the handler, i.e. to return
 * a handler with the correct number or parameters
 *
 * @public
 */
export type ResolvedStateChangeHandler<TState, THandler> = THandler extends (
  state: Immutable<TState>,
) => void
  ? (state: Immutable<TState>) => void
  : StateChangeHandler<TState>

/**
 * An object that can be used to unsubscribe from a subscription (e.g. for a
 * state change handler).
 *
 * @public
 */
export interface Subscription {
  /**
   * Unsubscribe from the subscription.
   */
  readonly unsubscribe: () => void
}

/**
 * A subscription for a state change handler.
 *
 * @public
 */
export interface StateChangeSubscription<
  TState,
  THandler extends StateChangeHandler<TState>
> extends Subscription {
  /**
   * The handler function. Useful for testing.
   */
  readonly handler: ResolvedStateChangeHandler<TState, THandler>
}

/**
 * Subscribe to state changes.
 *
 * @param handler - the handler function to be called whenever the state changes
 * @param options - configuration for the subscription
 *
 * @returns a subscription that can be used to unsubscribe from state changes
 *
 * @public
 */
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
 * @internal
 */
export interface _SimpluxModuleInternals<TState> {
  /**
   * The unique name of the module.
   */
  readonly name: string

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   */
  mockStateValue: TState | undefined

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   */
  readonly mutations: MutationDefinitions<TState>

  /**
   * This is part of the simplux internal API and should not be accessed
   * except by simplux extensions.
   */
  readonly mutationMocks: { [mutationName: string]: (...args: any[]) => TState }

  /**
   * A proxy to the Redux store's dispatch function. This is part of the
   * simplux internal API and should not be accessed except by simplux
   * extensions.
   */
  readonly dispatch: (action: AnyAction) => void

  /**
   * A proxy to the Redux store's dispatch function. This is part of the
   * simplux internal API and should not be accessed except by simplux
   * extensions.
   */
  readonly getReducer: () => Reducer

  /**
   * Get the current module state.
   *
   * @returns the module state
   */
  readonly getState: () => Immutable<TState>
}

/**
 * Interface for efficiently identifying simplux module objects at compile time.
 *
 * @public
 */
export interface SimpluxModuleMarker<TState> {
  /**
   * A symbol that allows efficient compile-time and run-time identification
   * of simplux module objects.
   *
   * This property will have an `undefined` value at runtime.
   *
   * @public
   */
  readonly [SIMPLUX_MODULE]: TState
}

/**
 * A simplux module that contains some state and allows controlled modification
 * and observation of the state.
 *
 * @public
 */
export interface SimpluxModule<TState> extends SimpluxModuleMarker<TState> {
  /**
   * A selector for getting the current module state.
   *
   * @returns the module state
   */
  readonly state: SimpluxSelector<TState, [], Immutable<TState>>

  /**
   * Replace the whole module state.
   *
   * @param state - the state to set for the module
   */
  readonly setState: (state: Immutable<TState>) => void

  /**
   * Register a handler to be called whenever the module's state
   * changes. The handler will be called immediately with the module's
   * current state when subscribing (can be changed by providing custom
   * options).
   *
   * @param handler - the function to call whenever the module's state changes
   *
   * @returns a subscription that can be unsubscribed from to remove the handler
   */
  readonly subscribeToStateChanges: SubscribeToStateChanges<TState>

  /**
   * Internal state that is used by simplux. This is part of the simplux
   * internal API and should not be accessed except by simplux extensions.
   *
   * @internal
   */
  readonly $simpluxInternals: _SimpluxModuleInternals<TState>
}

/**
 * This is part of the simplux internal API and should not be accessed
 * except by simplux extensions.
 *
 * @internal
 */
export function createModule<TState>(
  store: _SimpluxStore,
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  if (process.env.NODE_ENV !== 'production') {
    if (!config.name) {
      throw new Error('you must provide a module name!')
    }
  }

  const { getState, dispatch, subscribe, setReducer } = store

  const internals: _SimpluxModuleInternals<TState> = {
    name: config.name,
    mockStateValue: undefined,
    mutations: {},
    mutationMocks: {},
    dispatch,
    getReducer: () => simpluxStore.getReducer(config.name),
    getState: getModuleState,
  }

  function getModuleState(): Immutable<TState> {
    return internals.mockStateValue || getState()[config.name]
  }

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

  const defaultStateChangeHandlerOptions: Required<StateChangeHandlerOptions> = {
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

  type ShallowMutable<T> = { -readonly [prop in keyof T]: T[prop] }

  const result: ShallowMutable<SimpluxModule<TState>> = {
    state: undefined!,
    setState: setModuleState,
    subscribeToStateChanges,
    $simpluxInternals: internals,
    [SIMPLUX_MODULE]: undefined!,
  }

  const selectors = createSelectors(result, {
    state: (s) => s,
  })

  result.state = selectors.state

  return result
}

/**
 * Checks if an object is a simplux module.
 *
 * @param object - the object to check
 *
 * @returns true if the object is a simplux module
 *
 * @internal
 */
export function _isSimpluxModule<TState, TOther>(
  object: SimpluxModuleMarker<TState> | TOther,
): object is SimpluxModule<TState> {
  return object && Object.prototype.hasOwnProperty.call(object, SIMPLUX_MODULE)
}

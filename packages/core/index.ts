import { createStore, Reducer, Store } from 'redux'
import {
  createModule,
  SimpluxModule,
  SimpluxModuleConfig,
} from './src/module.js'
import { simpluxStore, _setReduxStore } from './src/store.js'

// we create and set a default redux store for simple scenarios
setReduxStoreForSimplux(createStore(getSimpluxReducer()), (s) => s)

export {
  createEffect,
  createEffects,
  SIMPLUX_EFFECT,
  _getEffectMocks,
  _isSimpluxEffect,
} from './src/effects.js'
export type {
  SimpluxEffect,
  SimpluxEffectDefinitions,
  SimpluxEffectMarker,
  SimpluxEffectMetadata,
  SimpluxEffects,
  _EffectMockDefinition,
} from './src/effects.js'
export { SIMPLUX_MODULE, _isSimpluxModule } from './src/module.js'
export type {
  ResolvedStateChangeHandler,
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleMarker,
  StateChangeHandler,
  StateChangeHandlerOptions,
  StateChangeSubscription,
  SubscribeToStateChanges,
  Subscription,
  _SimpluxModuleInternals,
} from './src/module.js'
export {
  createMutations,
  SIMPLUX_MUTATION,
  _isSimpluxMutation,
} from './src/mutations.js'
export type {
  MutationDefinition,
  MutationDefinitions,
  ResolvedMutation,
  SimpluxMutation,
  SimpluxMutationMarker,
  SimpluxMutations,
} from './src/mutations.js'
export {
  createSelectors,
  SIMPLUX_SELECTOR,
  _isSimpluxSelector,
} from './src/selectors.js'
export type {
  ResolvedSelector,
  SelectorDefinition,
  SelectorDefinitions,
  SimpluxSelector,
  SimpluxSelectorMarker,
  SimpluxSelectors,
} from './src/selectors.js'
export { _getStoreProxy } from './src/store.js'
export type { _InternalReduxStoreProxy, _SimpluxStore } from './src/store.js'
export * from './src/types.js'

// tslint:disable: max-line-length (cannot line break the links)

/**
 * Returns the root reducer that manages all simplux state.
 * This reducer should be combined with all the other reducers
 * your application has.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @returns the simplux root reducer
 *
 * @public
 */
export function getSimpluxReducer(): Reducer {
  return simpluxStore.rootReducer
}

/**
 * Create a new simplux module.
 *
 * A module has a unique name (provided via the `config` parameter)
 * and a type of state it contains (the initial state is provided via
 * the `config` parameter).
 *
 * The returned module contains functions for basic interaction with
 * the module as well as any other functions that are provided by the
 * extension packages you have loaded.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @param config - the configuration values for the module
 *
 * @returns the created module
 *
 * @public
 */
export function createSimpluxModule<TState>(
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState>

/**
 * Create a new simplux module.
 *
 * A module has a unique name and a type of state it contains.
 *
 * The returned module contains functions for basic interaction with
 * the module as well as any other functions that are provided by the
 * extension packages you have loaded.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @param name - the unique name of the module
 * @param initialState - the initial state of the module
 *
 * @returns the created module
 *
 * @public
 */
export function createSimpluxModule<TState>(
  name: string,
  initialState: TState,
): SimpluxModule<TState>

export function createSimpluxModule<TState>(
  configOrName: SimpluxModuleConfig<TState> | string,
  initialState?: TState,
): SimpluxModule<TState> {
  if (typeof configOrName === 'string') {
    const config: SimpluxModuleConfig<TState> = {
      name: configOrName,
      initialState: initialState!,
    }

    return createModule(simpluxStore, config)
  }

  return createModule(simpluxStore, configOrName)
}

/**
 * Set the redux store that simplux should use. It is required to call
 * this function before any created simplux module can be used.
 *
 * The second parameter must be a function that maps from the redux store's
 * root state to the simplux root state.
 *
 * If this function is called again with a new store, simplux will safely
 * switch over to the new store. However, no state is transferred and
 * therefore all modules are reset to their initial state. This is primarily
 * useful in server-side rendering scenarios.
 *
 * To learn more, have a look at the [getting started recipe](https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).
 *
 * @param storeToUse - the redux store that simplux should use
 * @param simpluxStateGetter - a mapper function from the redux root state
 * to the simplux root state
 *
 * @returns a cleanup function that when called disconnects simplux from the
 * redux store (but it does not remove any of the simplux state from the store)
 *
 * @public
 */
export function setReduxStoreForSimplux<TState>(
  storeToUse: Store<TState>,
  simpluxStateGetter: (rootState: TState) => any,
) {
  return _setReduxStore(storeToUse, simpluxStateGetter)
}

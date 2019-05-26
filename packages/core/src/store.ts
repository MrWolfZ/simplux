import {
  combineReducers,
  createStore as createReduxStore,
  Reducer,
  Store,
} from 'redux'

export interface ReduxStoreProxy {
  getState: () => any
  dispatch: Store['dispatch']
  subscribe: Store['subscribe']
}

let simpluxStore: SimpluxStore | undefined
let managedReduxStore: Store | undefined
let externalReduxStoreProxy: ReduxStoreProxy | undefined

export function getSimpluxStore() {
  if (!simpluxStore) {
    simpluxStore = createSimpluxStore(
      () => externalReduxStoreProxy || managedReduxStore!,
      s => s,
    )

    managedReduxStore = createReduxStore(simpluxStore.rootReducer)
  }

  return simpluxStore
}

export function useExistingStore<TState>(
  storeToUse: Store<TState>,
  simpluxStateGetter: (rootState: TState) => any,
) {
  externalReduxStoreProxy = {
    ...storeToUse,
    getState: () => simpluxStateGetter(storeToUse.getState()),
  }

  return () => {
    externalReduxStoreProxy = undefined
  }
}

export interface SimpluxStore {
  rootReducer: Reducer
  getState: () => any
  dispatch: Store['dispatch']
  subscribe: Store['subscribe']
  setReducer: <T = any>(name: string, reducer: Reducer<T>) => void
  getReducer: <T = any>(name: string) => Reducer<T>
}

export function createSimpluxStore(
  getStoreProxy: () => ReduxStoreProxy,
  stateGetter: (rootState: any) => any,
): SimpluxStore {
  const reducers: { [name: string]: Reducer } = {}
  let reducer: Reducer | undefined

  const rootReducer: Reducer = (state = {}, action) =>
    reducer ? reducer(state, action) : state

  return {
    rootReducer,
    getState: () => stateGetter(getStoreProxy().getState()),
    dispatch: action => getStoreProxy().dispatch(action),
    subscribe: listener => getStoreProxy().subscribe(listener),

    setReducer: (name, reducerToAdd) => {
      reducers[name] = reducerToAdd
      reducer = combineReducers(reducers)
    },

    getReducer: name => reducers[name],
  }
}

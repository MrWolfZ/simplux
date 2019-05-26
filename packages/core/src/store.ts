import { AnyAction, createStore, Store } from 'redux'
import { getChildReducer, getRootReducer, setChildReducer } from './reducer'

let store: Store | undefined
let stateGetter: (rootState: any) => any = s => s

export function getStore() {
  if (!store) {
    store = createStore(getRootReducer())
  }

  return store
}

export function useExistingStore<TState>(storeToUse: Store<TState>, simpluxStateGetter: (rootState: TState) => any) {
  store = storeToUse
  stateGetter = simpluxStateGetter
}

export function getStoreState() {
  return stateGetter(getStore().getState())
}

export function dispatch<TAction extends AnyAction = AnyAction>(action: TAction) {
  return getStore().dispatch(action)
}

export interface ReduxStoreProxy {
  getState: typeof getStoreState
  dispatch: typeof dispatch
  getChildReducer: typeof getChildReducer
  setChildReducer: typeof setChildReducer
}

export const storeProxy: ReduxStoreProxy = {
  getState: getStoreState,
  dispatch,
  getChildReducer,
  setChildReducer,
}

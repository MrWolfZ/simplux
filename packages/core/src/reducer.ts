import { Action, AnyAction, combineReducers, Reducer, ReducersMapObject } from 'redux'

const reducers: { [name: string]: Reducer } = {}
let reducer: Reducer | undefined

const rootReducer: Reducer = (state = {}, action) => reducer ? reducer(state, action) : state

export function getRootReducer() {
  return rootReducer
}

function createReducer() {
  return Object.keys(reducers).length > 0 ? combineReducers(reducers) : undefined
}

function updateReducer() {
  reducer = createReducer()
}

export function setChildReducer(name: string, reducer: Reducer) {
  reducers[name] = reducer
  updateReducer()
}

export function setChildReducers(reducersToSet: ReducersMapObject<unknown, any>) {
  Object.assign(reducers, reducersToSet)
  updateReducer()
}

export function removeChildReducer(name: string) {
  delete reducers[name]
  updateReducer()
}

export function getChildReducer<TState = any, TAction extends Action<string> = AnyAction>(name: string): Reducer<TState, TAction> {
  return reducers[name]
}

import { getSimpluxReducer, setReduxStoreForSimplux } from '@simplux/core'
import { combineReducers, createStore } from 'redux'
import { getCounterState } from './counter.module'

// we start by creating the store and configuring simplux
const rootReducer = combineReducers({
  simplux: getSimpluxReducer(),
})

const store = createStore(rootReducer)
setReduxStoreForSimplux(store, rootState => rootState.simplux)

console.log(`counter module state:`, getCounterState())

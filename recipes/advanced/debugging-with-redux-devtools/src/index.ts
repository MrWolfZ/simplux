// this code is part of the simplux recipe "debugging with Redux DevTools":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/debugging-with-redux-devtools

// setting up the Redux DevTools with simplux is done exactly the
// same way as for any normal Redux application; we just need to
// provide the store to simplux

import {
  createMutations,
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
import { combineReducers, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

const rootReducer = combineReducers({
  simplux: getSimpluxReducer(),
})

const store = createStore(rootReducer, composeWithDevTools())

setReduxStoreForSimplux(store, s => s.simplux)

// now when we create a module and call mutations we will see
// them in the Redux DevTools
const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: 0,
})

const counter = {
  ...counterModule,
  ...createMutations(counterModule, {
    increment: c => c + 1,
    incrementBy: (c, amount: number) => c + amount,
  }),
}

counter.increment()
counter.incrementBy(5)

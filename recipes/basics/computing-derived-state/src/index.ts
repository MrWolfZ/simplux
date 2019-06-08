import {
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
// this import registers the simplux selectors extension
import '@simplux/selectors'
import { combineReducers, createStore } from 'redux'

// we start by creating the store and configuring simplux
const rootReducer = combineReducers({
  simplux: getSimpluxReducer(),
})

const store = createStore(rootReducer)
setReduxStoreForSimplux(store, rootState => rootState.simplux)

// we create our module and destructure it into all
// the functions we are going to use
const { setState, createSelectors } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 10,
  },
})

// now we can define our selectors
const { plusOne, plus } = createSelectors({
  plusOne: ({ counter }) => counter + 1,
  plus: ({ counter }, amount: number) => counter + amount,
})

// by default, a selector needs to be provided with the state and
// any additional arguments it requires
console.log(`20 + 1:`, plusOne({ counter: 20 }))
console.log(`20 + 5:`, plus({ counter: 20 }, 5))

// but you can also call it bound to the latest state
console.log(`state + 1:`, plusOne.withLatestModuleState())
console.log(`state + 5:`, plus.withLatestModuleState(5))

// and when the store is updated, the selector will get called
// with the update state
const plusLatest = plus.withLatestModuleState
setState({ counter: 50 })
console.log(`updated state + 5:`, plusLatest(5))

// you can define new selectors at any time (but you cannot
// overwrite an existing selector)
const { minusOne } = createSelectors({
  minusOne: ({ counter }) => counter - 1,
})

console.log(`20 - 1:`, minusOne({ counter: 20 }))
console.log(`state - 1:`, minusOne.withLatestModuleState())

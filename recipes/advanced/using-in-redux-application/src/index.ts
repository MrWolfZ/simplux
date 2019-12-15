// this code is part of the simplux recipe "using simplux in my
// application together with Redux":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/using-in-redux-application

import { createSimpluxModule, getSimpluxReducer, setReduxStoreForSimplux } from '@simplux/core'
import { combineReducers, createStore, Reducer } from 'redux'

// let's say our application currently consists of a single simple
// counter reducer
const counterReducer: Reducer<number> = (c = 0, { type }) => (type === 'INC' ? c + 1 : c)

// when building your root reducer you can add a special reducer
// that simplux provides
const rootReducer = combineReducers({
  counter: counterReducer,

  // this key can be anything, but it is recommended to name the
  // slice of state that simplux is responsible for "simplux"
  simplux: getSimpluxReducer(),
})

// now we can construct our redux store as normal, allowing us to
// use all the redux goodies we are used to like middlewares
const store = createStore(rootReducer)

// the final thing we need to integrate simplux into this store is
// to let simplux know about it
setReduxStoreForSimplux(
  store,

  // this second parameter tells simplux where in the state it
  // can find its slice
  s => s.simplux,
)

// now you are ready to use simplux
const { getState } = createSimpluxModule({
  name: 'mySimpluxModule',
  initialState: {
    value: 'mySimpluxState',
  },
})

console.log('my module state:', getState())
console.log('full redux state:', store.getState())

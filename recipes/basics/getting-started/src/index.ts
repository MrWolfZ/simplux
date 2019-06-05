import {
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
import { createStore } from 'redux'

// this code is part of the recipe for getting started with
// simplux, which you can find here:
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started

// first, we create a redux store that only contains simplux state
const store = createStore(getSimpluxReducer())

// then, we tell simplux to use our store; the second argument
// exists to tell simplux where it can find its state on the
// root state, which in this case is the root state itself
setReduxStoreForSimplux(store, s => s)

// state in simplux is organized into modules; here we create
// our first simple counter module
const counterModule = createSimpluxModule({
  // this name uniquely identifies our module
  name: 'counter',

  // this value determines the shape of our state
  initialState: {
    counter: 0,
  },
})

// you can get the current state of the module via getState
console.log('initial state:', counterModule.getState())

// to change the state, we can define mutations; a mutation
// is a pure function that takes the current module state and
// optionally some additional arguments and returns a new
// updated state
const { increment, incrementBy } = counterModule.createMutations({
  // we can have mutations that only use the state
  increment: state => ({ ...state, counter: state.counter + 1 }),

  // our mutations can also have arguments
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})

// to update the module state, simply call a mutation (this
// dispatches a redux action internally)
increment()
console.log('incremented counter:', counterModule.getState())

// we can also pass arguments to a mutation
incrementBy(5)
console.log('incremented counter by 5:', counterModule.getState())

// executing a mutation returns the updated state
console.log('final state:', increment())

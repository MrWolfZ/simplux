// this code is part of the simplux recipe "getting started":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started

import { createSimpluxModule } from '@simplux/core'

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

// the simplest thing you can do with a module is to get its state
console.log('initial state:', counterModule.getState())

// to change the state we can define mutations; a mutation
// is a pure function that takes the current module state and
// optionally some additional arguments and returns a new
// updated state
const { increment, incrementBy } = counterModule.createMutations({
  // we can have mutations that only use the state
  increment: state => ({ ...state, counter: state.counter + 1 }),

  // but they can also have arguments
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})

// to update the module's state, simply call a mutation
increment()
console.log('incremented counter:', counterModule.getState())

// we can also pass arguments to a mutation
incrementBy(5)
console.log('incremented counter by 5:', counterModule.getState())

// executing a mutation returns the updated state
console.log('final state:', increment())

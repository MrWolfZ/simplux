// this code is part of the simplux recipe "getting started":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/getting-started

import { createMutations, createSimpluxModule } from '@simplux/core'

// state in simplux is organized into modules; here we create
// our first simple counter module; the name (first parameter)
// uniquely identifies our module; the second parameter is the
// initial state of the module
const counterModule = createSimpluxModule('counter', { value: 0 })

// you can access the module's current state with getState
console.log('initial state:', counterModule.getState())

// to change the state we can define mutations; a mutation
// is a pure function that takes the current module state and
// optionally some additional arguments and modifies the state
// or returns a new updated state
const { increment, incrementBy } = createMutations(counterModule, {
  // we can have mutations that only use the state
  increment: state => {
    state.value += 1
  },

  // but they can also have arguments
  incrementBy: (state, amount: number) => {
    state.value += amount
  },
})

// to update the module's state, simply call a mutation
increment()
console.log('incremented counter:', counterModule.getState())

// we can also pass arguments to a mutation
incrementBy(5)
console.log('incremented counter by 5:', counterModule.getState())

// executing a mutation returns the updated state
console.log('final state:', increment())

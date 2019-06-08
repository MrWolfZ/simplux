// this code is part of the simplux recipe "computing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/computing-derived-state

import { createSimpluxModule } from '@simplux/core'
// this import registers the simplux selectors extension
import '@simplux/selectors'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 10,
  },
})

// to compute derived state we can define selectors; a selector
// is a pure function that takes the current module state and
// optionally some additional arguments and returns some derived
// state
const { plusOne, plus } = counterModule.createSelectors({
  // we can have selectors that only use the state
  plusOne: ({ counter }) => counter + 1,

  // but they can also have arguments
  plus: ({ counter }, amount: number) => counter + amount,
})

// by default, a selector needs to be provided with the state and
// any additional arguments it requires
console.log(`20 + 1:`, plusOne({ counter: 20 }))
console.log(`20 + 5:`, plus({ counter: 20 }, 5))

// but you can also call it bound to the latest state
console.log(`state + 1:`, plusOne.withLatestModuleState())
console.log(`state + 5:`, plus.withLatestModuleState(5))

// when the store is updated, the selector will get called
// with the updated state
const plusLatest = plus.withLatestModuleState
counterModule.setState({ counter: 50 })
console.log(`updated state + 5:`, plusLatest(5))

// this code is part of the simplux recipe "computing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/computing-derived-state

import { createSelectors, createSimpluxModule } from '@simplux/core'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 10,
  },
})

// to compute derived state we can define selectors; a selector
// is a pure function that takes the module's current state and
// optionally some additional arguments and returns some derived
// value
const { plusOne, plus } = createSelectors(counterModule, {
  // we can have selectors that only use the state
  plusOne: ({ value }) => value + 1,

  // but they can also have arguments
  plus: ({ value }, amount: number) => value + amount,
})

// by default, a selector is evaluated with the module's latest state
console.log(`state + 1:`, plusOne()) // prints 11
console.log(`state + 5:`, plus(5)) // prints 15

// but you can also call a selector with a specific state
console.log(`20 + 1:`, plusOne.withState({ value: 20 })) // prints 21
console.log(`20 + 5:`, plus.withState({ value: 20 }, 5)) // prints 25

// when the module's state is changed, the selector will get
// evaluated with the changed state
counterModule.setState({ value: 50 })
console.log(`changed state + 5:`, plus(5))

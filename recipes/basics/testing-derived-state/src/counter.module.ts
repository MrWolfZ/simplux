// this code is part of the simplux recipe "testing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state

import { createSelectors, createSimpluxModule } from '@simplux/core'

export interface CounterState {
  counter: number
}

export const counterModule = createSimpluxModule<CounterState>({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

export const { plusOne, plus } = createSelectors(counterModule, {
  plusOne: ({ counter }) => counter + 1,
  plus: ({ counter }, amount: number) => counter + amount,
})

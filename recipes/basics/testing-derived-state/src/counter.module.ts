// this code is part of the simplux recipe "testing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state

import { createSelectors, createSimpluxModule } from '@simplux/core'

export interface CounterState {
  value: number
}

const counterModule = createSimpluxModule<CounterState>({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

export const counter = {
  ...counterModule,
  ...createSelectors(counterModule, {
    plusOne: ({ value }) => value + 1,
    plus: ({ value }, amount: number) => value + amount,
  }),
}

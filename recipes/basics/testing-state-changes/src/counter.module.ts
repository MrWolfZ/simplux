// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import { createMutations, createSimpluxModule } from '@simplux/core'

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
  ...createMutations(counterModule, {
    increment: state => {
      state.value += 1
    },
    incrementBy: (state, amount: number) => {
      state.value += amount
    },
  }),
}

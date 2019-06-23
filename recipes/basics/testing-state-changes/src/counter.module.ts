// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import { createMutations, createSimpluxModule } from '@simplux/core'

export interface CounterState {
  counter: number
}

export const counterModule = createSimpluxModule<CounterState>({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

export const getCounterState = counterModule.getState

export const { increment, incrementBy } = createMutations(counterModule, {
  increment: state => {
    state.counter += 1
  },

  incrementBy: (state, amount: number) => {
    state.counter += amount
  },
})

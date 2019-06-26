// this code is part of the simplux recipe "testing my React components":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-component

import {
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'
import { createSelectorHook } from '@simplux/react'

export const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

export const useCounter = createSelectorHook(counterModule)

export const { increment, incrementBy } = createMutations(counterModule, {
  increment(state) {
    state.value += 1
  },

  incrementBy(state, amount: number) {
    state.value += amount
  },
})

export const { selectCounterValue, selectCounterValueTimes } = createSelectors(
  counterModule,
  {
    selectCounterValue: ({ value }) => value,

    selectCounterValueTimes: ({ value }, multiplier: number) =>
      value * multiplier,
  },
)

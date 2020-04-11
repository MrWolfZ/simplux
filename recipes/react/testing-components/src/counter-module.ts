// this code is part of the simplux recipe "testing my React components":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-component

import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'

const counterModule = createSimpluxModule('counter', { value: 0 })

export const counter = {
  ...counterModule,
  ...createMutations(counterModule, {
    increment(state) {
      state.value += 1
    },
    incrementBy(state, amount: number) {
      state.value += amount
    },
  }),
  ...createSelectors(counterModule, {
    value: ({ value }) => value,
    valueTimes: ({ value }, multiplier: number) => value * multiplier,
  }),
}

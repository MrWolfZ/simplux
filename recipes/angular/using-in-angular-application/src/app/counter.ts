// this code is part of the simplux recipe "using simplux in my Angular application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/angular/using-in-angular-application

import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'

export const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

export const counterMutations = createMutations(counterModule, {
  increment(state) {
    state.value += 1
  },
  incrementBy(state, amount: number) {
    state.value += amount
  },
})

export const counterSelectors = createSelectors(counterModule, {
  value: ({ value }) => value,
  valueTimes: ({ value }, multiplier: number) => value * multiplier,
})

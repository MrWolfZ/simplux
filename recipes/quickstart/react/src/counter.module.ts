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
    value: state => state.value,
    plus: (state, amount: number) => state.value + amount,
  }),
}

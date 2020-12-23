import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'

// state in simplux is contained in modules identified by a unique name
const counterModule = createSimpluxModule('counter', { value: 0 })

export const counter = {
  ...counterModule,

  // use mutations to modify the state
  ...createMutations(counterModule, {
    increment(state) {
      state.value += 1
    },
    incrementBy(state, amount: number) {
      state.value += amount
    },
  }),

  // use selectors to access the state
  ...createSelectors(counterModule, {
    value: state => state.value,
    plus: (state, amount: number) => state.value + amount,
  }),
}

counter.increment()
console.log('incremented counter:', counter.value())
console.log('counter value + 2:', counter.plus(2))

counter.incrementBy(5)
console.log('incremented counter by 5:', counter.value())

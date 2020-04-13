# Quickstart: counter

A quickstart example for using **simplux**.

```sh
npm i @simplux/core -S
```

```ts
import { createSimpluxModule, createMutations, createSelectors } from '@simplux/core'

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
```

See this example in action [here](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/quickstart/counter). For a more detailed look into how simplux can make your life simple follow our recipe for [getting started](../../basics/getting-started#readme).

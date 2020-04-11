# Recipe: testing my state changes

This recipe shows how simple it is to test your state changes with **simplux**.

If you are new to **simplux** there is [a recipe](../getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes).

Before we start let's install **simplux**.

```sh
npm i @simplux/core -S
```

Now we're ready to go.

State changes in **simplux** are performed through _mutations_. Mutations are very simple to test as you will see. For this recipe we use a simple counter module with two mutations.

```ts
import { createMutations, createSimpluxModule } from '@simplux/core'

interface CounterState {
  counter: number
}

const counterModule = createSimpluxModule<CounterState>('counter', { value: 0 })

const counter = {
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
```

Let's start by testing our `increment` mutation. By default mutations will update their module's state when called. However, it is best to test our mutations in isolation with a specific state value. This can be done by using `withState`. When called this way the mutation does not affect the module's state at all.

```ts
const testState: CounterState = { value: 10 }

describe('increment', () => {
  it('increments the counter by one', () => {
    const result = counter.increment.withState(testState)
    expect(result.value).toBe(11)
  })
})
```

We can also use `withState` to test our mutations that take arguments.

```ts
describe('incrementBy', () => {
  it('increments the counter by the provided amount', () => {
    const result = counter.incrementBy.withState(testState, 5)
    expect(result.value).toBe(15)
  })
})
```

And that is all you need for testing your state changes with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

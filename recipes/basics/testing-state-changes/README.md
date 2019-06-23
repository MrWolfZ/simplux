# Recipe: testing my state changes

This recipe shows how simple it is to test your state changes with **simplux**.

If you are new to **simplux** there is [a recipe](../getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core redux -S
```

Now we're ready to go.

State changes in **simplux** are performed through _mutations_. Mutations are very simple to test as you will see. For this recipe we use a simple counter module with two mutations.

```ts
import { createMutations, createSimpluxModule } from '@simplux/core'

interface CounterState {
  counter: number
}

const counterModule = createSimpluxModule<CounterState>({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

const { increment, incrementBy } = createMutations(counterModule, {
  increment: state => {
    state.counter += 1
  },

  incrementBy: (state, amount: number) => {
    state.counter += amount
  },
})
```

Let's start by testing our `increment` mutation. By default mutations will update their module's state when called. However, it is best to test our mutations in isolation with a specific state value. This can be done by using `withState`.

```ts
const testState: CounterState = { counter: 10 }

describe('increment', () => {
  it('increments the counter by one', () => {
    const result = increment.withState(testState)()
    expect(result.counter).toBe(11)
  })
})
```

We can also use `withState` to test our mutations that take arguments.

```ts
describe('incrementBy', () => {
  it('increments the counter by the provided amount', () => {
    const result = incrementBy.withState(testState)(5)
    expect(result.counter).toBe(15)
  })
})
```

And that is all you need for testing your state changes with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

# Recipe: testing derived state

This recipe shows how simple it is to test your derived state with **simplux**.

If you are new to computing derived state with **simplux** there is [a recipe](../computing-derived-state#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state).

Before we start let's install **simpux**.

```sh
npm i @simplux/preset -S
```

Now we're ready to go.

Computing derived state for **simplux** modules is done with _selectors_. Selectors are very simple to test as you will see. For this recipe we use a simple counter module with two selectors.

```ts
import { createSelectors, createSimpluxModule } from '@simplux/core'

interface CounterState {
  counter: number
}

const counterModule = createSimpluxModule<CounterState>({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const counter = {
  ...counterModule,
  ...createSelectors(counterModule, {
    plusOne: ({ value }) => value + 1,
    plus: ({ value }, amount: number) => value + amount,
  }),
}
```

Let's start by testing our `plusOne` selector. It is best to test the selector in isolation by calling it with a specific state.

```ts
const testState: CounterState = { counter: 10 }

describe('plusOne', () => {
  it('returns the counter plus one', () => {
    const result = counter.plusOne.withState(testState)
    expect(result).toBe(11)
  })
})
```

This also works with selectors that take arguments.

```ts
describe('plus', () => {
  it('returns the sum of the counter and the amount', () => {
    const result = counter.plus.withState(testState, 5)
    expect(result).toBe(15)
  })
})
```

And that is all you need for testing your derived state with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

# Recipe: testing derived state

This recipe shows how simple it is to test your derived state with **simplux**.

If you are new to computing derived state with **simplux** there is [a recipe](../computing-derived-state#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/selectors redux -S
```

We also need to activate the selectors extension by importing the package. You can either add this import to every test file or do it once globally with the mechanism your test framework provides (e.g. [Jest](https://jestjs.io/) allows you to configure `setupFiles` where you can place this import).

```ts
import '@simplux/selectors'
```

Now we're ready to go.

Computing derived state for **simplux** modules is done with _selectors_. Selectors are very simple to test as you will see. For this recipe we use a simple counter module with two selectors.

```ts
import { createSimpluxModule } from '@simplux/core'

const { setState, createSelectors } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

const { plusOne, plus } = createSelectors({
  plusOne: ({ counter }) => counter + 1,
  plus: ({ counter }, amount: number) => counter + amount,
})
```

Let's start by testing our `plusOne` selector. The recommended approach is to test the selector in isolation by calling it directly.

```ts
describe('plusOne', () => {
  it('returns the counter plus one', () => {
    const result = plusOne({ counter: 10 })
    expect(result).toBe(11)
  })
})
```

However, in certain scenarios it may be useful to test the selector with the module's latest state. To achieve this we can use `withLatestModuleState` after setting the module's state to the required value.

```ts
describe('plusOne', () => {
  it('returns the counter plus one', () => {
    setState({ counter: 20 })
    const result = plusOne.withLatestModuleState()
    expect(result).toBe(21)
  })
})
```

Both of these approaches also work with selectors that take arguments.

```ts
describe('plus', () => {
  it('returns the sum of the counter and the amount', () => {
    const result1 = plus({ counter: 10 }, 5)
    expect(result1).toBe(15)

    setState({ counter: 20 })
    const result2 = plus.withLatestModuleState(5)
    expect(result2).toBe(25)
  })
})
```

And that is all you need for testing your derived state with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

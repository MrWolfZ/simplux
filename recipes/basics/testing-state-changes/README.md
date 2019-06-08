# Recipe: testing state changes

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
const { setState, createMutations } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

const { increment, incrementBy } = createMutations({
  increment: state => ({ ...state, counter: state.counter + 1 }),
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})
```

Let's start by testing our `increment` mutation. The recommended approach is to test the mutation in isolation by using `withState`.

```ts
describe('increment', () => {
  it('increments the counter by one', () => {
    const result = increment.withState({ counter: 10 })()
    expect(result.counter).toBe(11)
  })
})
```

By default a mutation is applied to the module's current state. `withState` allows you to provide a custom module state for calling the mutation. This way the mutation is tested in perfect isolation since no changes to the module are performed.

However, in certain scenarios it may be useful to test the mutation with the module. To achieve this we can simply set the module's state to the required value before calling the mutation.

```ts
describe('increment', () => {
  it('increments the counter by one', () => {
    setState({ counter: 10 })
    const result = increment()
    expect(result.counter).toBe(11)
  })
})
```

Both of these approaches also work with mutations that take arguments.

```ts
describe('incrementBy', () => {
  it('increments the counter by the provided amount', () => {
    const result1 = incrementBy.withState({ counter: 10 })(5)
    expect(result1.counter).toBe(15)

    setState({ counter: 20 })
    const result2 = incrementBy(5)
    expect(result2.counter).toBe(25)
  })
})
```

And that is all you need for testing your state changes with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

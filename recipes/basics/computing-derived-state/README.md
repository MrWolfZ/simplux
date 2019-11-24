# Recipe: computing derived state

This recipe shows how simple it is to compute derived state for your **simplux** modules.

If you are new to **simplux** there is [a recipe](../getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/computing-derived-state).

Before we start let's install **simplux**.

```sh
npm i @simplux/core -S
```

Now we're ready to go.

In **simplux** all state is contained in _modules_, so let's create one.

```ts
import { createSimpluxModule } from '@simplux/core'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 10,
  },
})
```

To compute derived state for our module we can define so-called _selectors_. A selector is a pure function that takes the module's state - and optionally some additional arguments - and returns some derived value.

```ts
import { createSelectors } from '@simplux/core'

// to compute derived state we can define selectors
const { plusOne, plus } = createSelectors(counterModule, {
  // we can have selectors that only use the state
  plusOne: ({ value }) => value + 1,

  // but they can also have arguments
  plus: ({ value }, amount: number) => value + amount,
})

// by default, a selector is evaluated with the module's latest state
console.log(`state + 1:`, plusOne()) // prints 11
console.log(`state + 5:`, plus(5)) // prints 15

// but you can also call a selector with a specific state
console.log(`20 + 1:`, plusOne.withState({ value: 20 })) // prints 21
console.log(`20 + 5:`, plus.withState({ value: 20 }, 5)) // prints 25

// when the module's state is changed, the selector will get
// evaluated with the changed state
counterModule.setState({ value: 50 })
console.log(`changed state + 5:`, plus(5))
```

And that is all you need to compute derived state with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

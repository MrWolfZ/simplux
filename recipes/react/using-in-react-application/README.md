# Recipe: using **simplux** in my React application

This recipe shows you how simple it is to integrate **simplux** into your React application.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/using-in-react-application).

Before we start let's install all the packages we need (we assume you already have all packages required for React installed).

```sh
npm i @simplux/core @simplux/immer @simplux/react @simplux/selectors redux -S
```

We also register all extension packages.

```ts
import '@simplux/immer'
import '@simplux/react'
import '@simplux/selectors'
```

Now we're ready to go.

In this recipe we are going to build a simple counter component. Let's start by creating our module with some simple mutations and selectors. The React extension package adds a new `react` property to our modules that provides us a with a React hook called `useSelector` for using a module's state in a component.

```ts
const {
  createMutations,
  createSelectors,

  // the simplux react extension adds a hook for using the module's
  // state in a component
  react: {
    hooks: { useSelector },
  },
} = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const { increment, incrementBy } = createMutations({
  increment(state) {
    state.value += 1
  },

  incrementBy(state, amount: number) {
    state.value += amount
  },
})

const { selectCounterValue } = createSelectors({
  selectCounterValue: ({ value }) => value,
})
```

Now we can start using this module in our counter component. As the name suggests the `useSelector` hook allows us to use our module's selectors inside our component. This hook also ensures that the component is updated whenever the selected value changes.

```tsx
const Counter = () => {
  const value = useSelector(selectCounterValue)

  // we can also use an inline selector
  const valueTimesTwo = useSelector(s => s.value * 2)

  return (
    <>
      value: {value}
      <br />
      value * 2: {valueTimesTwo}
      <br />
      {/* we can use mutations directly as event handlers */}
      <button onClick={increment}>Increment</button>
      {/* we can also use mutations with arguments */}
      <button onClick={() => incrementBy(5)}>Increment by 5</button>
    </>
  )
}
```

And that is all you need to use **simplux** in your React application.

If your application also uses Redux we recommend you take a look at [our recipe](../../advanced/using-in-redux-application#readme) for using **simplux** with a custom Redux store.

We also encourage you to learn about [how to test](../testing-components-using-state#readme) the component that we have just created.

# Recipe: using **simplux** in my React application

This recipe shows you how simple it is to integrate **simplux** into your React application.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/using-in-react-application).

Before we start let's install all the packages we need (we assume you already have all packages required for React installed).

```sh
npm i @simplux/core @simplux/react @simplux/selectors redux -S
```

Now we're ready to go.

In this recipe we are going to build a simple counter component. Let's start by creating our module with some simple mutations and selectors. The React extension package adds a new `react` property to our modules that provides us a with a React hook called `useSelector` for using a module's state in a component.

```ts
import { createSimpluxModule, createMutations } from '@simplux/core'
import { createSelectors } from '@simplux/selectors'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const { increment, incrementBy } = createMutations(counterModule, {
  increment(state) {
    state.value += 1
  },

  incrementBy(state, amount: number) {
    state.value += amount
  },
})

const { selectCounterValue, selectCounterValueTimes } = createSelectors(
  counterModule,
  {
    selectCounterValue: ({ value }) => value,

    selectCounterValueTimes: ({ value }, multiplier: number) =>
      value * multiplier,
  },
)
```

To use this module inside a React component we need something extra to ensure the component properly updates when the module's state changes. This is where the **simplux** react extension comes into play. It provides a function `createSelectorHook` that creates a [React hook](https://reactjs.org/docs/hooks-intro.html) which allows using a module's state in a component and also ensuring that the component is updated when necessary.

```tsx
import { createSelectorHook } from '@simplux/react'

const useCounter = createSelectorHook(counterModule)
```

Now we can start using the counter module in our counter component. As the name of the `createSelectorHook` function suggests the created `useCounter` hook allows us to use our module's selectors inside our component ([this recipe](../../basics/computing-derived-state#readme) will help you if you are unfamiliar with selectors). This hook also ensures that the component is updated whenever the selected value changes.

> Mutations can be used inside components without any extra effort.

```tsx
import React from 'react'

const Counter = () => {
  const value = useCounter(selectCounterValue)

  // the selector can be defined inline
  const valueTimesTwo = useCounter(s => s.value * 2)

  // and for selectors that take additional arguments we can call the
  // selector as a factory to create a new selector for only the state
  const selectCounterValueTimesFive = selectCounterValueTimes.asFactory(5)
  const valueTimesFive = useCounter(selectCounterValueTimesFive)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value * 2: {valueTimesTwo}</span>
      <br />
      <span>value * 5: {valueTimesFive}</span>
      <br />
      {/* we can use mutations directly as event handlers */}
      <button onClick={increment}>Increment</button>
      <br />
      {/* we can also use mutations with arguments */}
      <button onClick={() => incrementBy(5)}>Increment by 5</button>
    </>
  )
}
```

Finally, if you do want or need your component to be a class component (and therefore cannot use hooks) we recommend that you build a functional wrapper component that uses module selector hooks to select the state your component requires and passes it to your class component as props. Note that mutations can be used directly in class components. Let's have a look at how our counter component would look like as a class component.

```tsx
import React from 'react'

interface CounterProps {
  value: number
  valueTimesTwo: number
  valueTimesFive: number
}

class CounterComponent extends React.Component<CounterProps> {
  render() {
    const { value, valueTimesTwo, valueTimesFive } = this.props

    return (
      <>
        <span>value: {value}</span>
        <br />
        <span>value * 2: {valueTimesTwo}</span>
        <br />
        <span>value * 5: {valueTimesFive}</span>
        <br />
        {/* mutations can still be used directly */}
        <button onClick={increment}>Increment</button>
        <br />
        <button onClick={() => incrementBy(5)}>Increment by 5</button>
      </>
    )
  }
}

const CounterWrapper = () => {
  const value = useCounter(selectCounterValue)
  const valueTimesTwo = useCounter(s => s.value * 2)
  const valueTimesFive = useCounter(selectCounterValueTimes.asFactory(5))

  const props = { value, valueTimesTwo, valueTimesFive }
  return <CounterComponent {...props} />
}
```

And that is all you need to use **simplux** in your React application.

We encourage you to also learn about [how to test](../testing-components-using-state#readme) the component that we have just created.

If your application also uses Redux we recommend you take a look at [our recipe](../../advanced/using-in-redux-application#readme) for using **simplux** with a custom Redux store.

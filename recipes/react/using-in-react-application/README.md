# Recipe: using **simplux** in my React application

This recipe shows you how simple it is to integrate **simplux** into your React application.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/using-in-react-application).

Before we start let's install **simplux** (we assume you already have all packages required for React installed).

```sh
npm i @simplux/preset-react -S
```

Now we're ready to go.

In this recipe we are going to build a simple counter component. Let's start by creating our module with some simple mutations and selectors.

```ts
import {
  createSelectors,
  createSimpluxModule,
  createMutations,
} from '@simplux/core'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const counter = {
  ...counterModule,
  ...createMutations(counterModule, {
    increment(state) {
      state.value += 1
    },
    incrementBy(state, amount: number) {
      state.value += amount
    },
  }),
  ...createSelectors(counterModule, {
    value: ({ value }) => value,
    valueTimes: ({ value }, multiplier: number) => value * multiplier,
  }),
}
```

To use this module's state inside a React component we can use the `useSimplux` [hook](https://reactjs.org/docs/hooks-intro.html) from the **simplux** react package. This hook takes a module selector (plus its extra arguments if any) evaluates it with the module's current state ([this recipe](../../basics/computing-derived-state#readme) will help you if you are unfamiliar with selectors). The hook also ensures that the component is updated whenever the selected value changes.

> Mutations can be used inside components directly.

```tsx
import React from 'react'
import { useSimplux } from '@simplux/react'

const Counter = () => {
  const value = useSimplux(counter.value)

  // provide any arguments for the selector directly to the hook
  const valueTimesFive = useSimplux(counter.valueTimes, 5)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value * 5: {valueTimesFive}</span>
      <br />
      {/* we can use mutations directly as event handlers */}
      <button onClick={counter.increment}>Increment</button>
      <br />
      {/* we can also use mutations with arguments */}
      <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
    </>
  )
}
```

> Since the **simplux** react package uses hooks it requires at least React version 16.8.

If you want or need your component to be a class component (and therefore cannot use hooks directly) we recommend that you build a functional wrapper component with `useSimplux` to select the state your component requires and pass it to your class component as props. Mutations can be used directly in class components just like in functional components. Let's have a look at how our counter component would look like as a class component.

```tsx
import React from 'react'
import { useSimplux } from '@simplux/react'

interface CounterProps {
  value: number
  valueTimesFive: number
}

class CounterComponent extends React.Component<CounterProps> {
  render() {
    const { value, valueTimesFive } = this.props

    return (
      <>
        <span>value: {value}</span>
        <br />
        <span>value * 5: {valueTimesFive}</span>
        <br />
        {/* mutations can still be used directly */}
        <button onClick={counter.increment}>Increment</button>
        <br />
        <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
      </>
    )
  }
}

const CounterWrapper = () => {
  const value = useSimplux(counter.value)
  const valueTimesFive = useSimplux(counter.valueTimes, 5)
  const props = { value, valueTimesFive }
  return <CounterComponent {...props} />
}
```

And that is all you need to use **simplux** in your React application.

We encourage you to also learn about [how to test](../testing-components-using-state#readme) the component that we have just created.

If your application uses Redux we recommend you take a look at [our recipe](../../advanced/using-in-redux-application#readme) for using **simplux** with Redux.

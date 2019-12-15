# Recipe: using lazy loaded React components/code splitting

This recipe shows you how simple it is to use **simplux** with your lazy loaded React components and while using code splitting for your application.

If you are new to using **simplux** with React there is [a recipe](../using-in-react-application#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/using-lazy-loading-code-splitting).

Before we start let's install **simplux** (we assume you already have all packages required for React installed).

```sh
npm i @simplux/core @simplux/react -S
```

Now we're ready to go.

**simplux** supports lazy loading and code splitting out-of-the-box. Therefore, there is nothing you need to do except using the standard technique for lazy loading your components. In this recipe we are going to build such a lazily loaded counter component so that you can see that it works. Let's start by creating our module and the component that uses it.

```tsx
import {
  createSelectors,
  createSimpluxModule,
  createMutations,
} from '@simplux/core'

const lazyCounterModule = createSimpluxModule({
  name: 'lazyCounter',
  initialState: {
    value: 0,
  },
})

const lazyCounter = {
  ...lazyCounterModule,
  ...createMutations(lazyCounterModule, {
    increment(state) {
      state.value += 1
    },
  }),
  ...createSelectors(lazyCounterModule, {
    value: ({ value }) => value,
  }),
}

const LazyCounter = () => {
  const value = useSimplux(lazyCounter.value)

  return (
    <>
      <span>lazy value: {value}</span>
      <button onClick={lazyCounter.increment}>Increment</button>
    </>
  )
}

export default LazyCounter
```

We can now use this component in our app by lazily loading it.

```tsx
import { SimpluxProvider } from '@simplux/react'
import React, { lazy, Suspense, useState } from 'react'
import { render } from 'react-dom'

const LazyCounter = lazy(() => import('./lazyCounter'))

const App = () => {
  const [lazyCounterIsVisible, setLazyCounterIsVisible] = useState(false)
  const makeLazyCounterVisible = () => setLazyCounterIsVisible(true)

  return <SimpluxProvider>{renderLazyCounterOrButton()}</SimpluxProvider>

  function renderLazyCounterOrButton() {
    if (lazyCounterIsVisible) {
      return (
        <Suspense fallback='Loading lazy counter...'>
          <LazyCounter />
        </Suspense>
      )
    }

    return <button onClick={makeLazyCounterVisible}>Load lazy counter</button>
  }
}

render(<App />, document.getElementById('root'))
```

When you run this example (e.g. through [the code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/using-lazy-loading-code-splitting)) you will see that the counter is working perfectly after loading it. The code for this example also contains a normal counter component that is eagerly loaded to show that eagerly and lazily loaded modules work perfectly side-by-side.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

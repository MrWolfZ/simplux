# Recipe: using hot module reloading in my React application

This recipe shows you how simple it is to use **simplux** in your React application that uses hot module reloading (HMR).

If you are new to using **simplux** with React there is [a recipe](../using-in-react-application#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/using-hot-module-reloading). Note that the code may seem to work properly in the sandbox but that is due to its integrated hot reloading. If you want to see this recipe in action properly we recommend you run it locally.

Before we start let's install **simplux** (we assume you already have all packages required for React installed).

```sh
npm i @simplux/core @simplux/react -S
```

Now we're ready to go.

**simplux** supports hot module reloading out-of-the-box. Therefore, there is nothing you need to do except using one of the methods for enabling hot module reloading in React apps. In this recipe we are going to going to use `create-react-app` and `react-app-rewired` to create an app which shows that hot module reloading works.

We start by installing the required dependencies.

```sh
npm i react-app-rewired react-hot-loader react-app-rewire-hot-loader @hot-loader/react-dom -D
```

Then we update the `scripts` in our `package.json`.

```json
"start": "react-app-rewired start",
"build": "react-app-rewired build",
```

Finally, we create a `config-overrides.js` file.

```js
const rewireReactHotLoader = require('react-app-rewire-hot-loader')

module.exports = function override(config, env) {
  config = rewireReactHotLoader(config, env)

  config.resolve.alias = {
    ...config.resolve.alias,
    'react-dom': '@hot-loader/react-dom',
  }

  return config
}
```

With this out of the way we can now create our app. Let's start with a counter module and component.

```tsx
import { createSelectors, createSimpluxModule, createMutations } from '@simplux/core'

const counterModule = createSimpluxModule('counter', { value: 0 })

const counter = {
  ...counterModule,
  ...createMutations(counterModule, {
    increment(state) {
      state.value += 1
    },
  }),
  ...createSelectors(counterModule, {
    value: ({ value }) => value,
  }),
}

const CounterImpl = () => {
  const value = useSimplux(counter.value)

  return (
    <>
      <span>value: {value}</span>
      <button onClick={counter.increment}>Increment</button>
    </>
  )
}
```

Since we want this counter to be hot reloaded we wrap it in `hot` before exporting it.

```tsx
import { hot } from 'react-hot-loader'

export const Counter = hot(module)(CounterImpl)
```

We can now use this component in our app.

```tsx
import { SimpluxProvider } from '@simplux/react'
import React from 'react'
import { render } from 'react-dom'
import { Counter } from './counter'

const App = () => (
  <SimpluxProvider>
    <Counter />
  </SimpluxProvider>
)

render(<App />, document.getElementById('root'))
```

When you run this example locally and make changes to the code you will see that the state of the counter is retained. You could for example do the following:

1. click the `Increment` button (the displayed value changes to 1)
2. change the `increment` mutation to be `state.value += 2` (the displayed value remains 1, i.e. the state is retained)
3. click the `Increment` button (the displayed value changes to 3, i.e. our change was applied)
4. change the `CounterImpl` to contain `<span>value * 2: {value * 2}</span>` (this will display 6)

And that is all you need to use **simplux** with hot module reloading in your React application.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

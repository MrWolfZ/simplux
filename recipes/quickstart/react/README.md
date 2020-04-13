# Quickstart: React

A quickstart example for using **simplux** with React.

```sh
npm i @simplux/core @simplux/react -S
```

```ts
// counter.module.ts
import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'

const counterModule = createSimpluxModule('counter', { value: 0 })

export const counter = {
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
    value: state => state.value,
    plus: (state, amount: number) => state.value + amount,
  }),
}
```

```tsx
// index.tsx
import { SimpluxProvider, useSimplux } from '@simplux/react'
import React from 'react'
import { render } from 'react-dom'
import { counter } from './counter.module'

const Counter = () => {
  const value = useSimplux(counter.value)
  const valuePlusFive = useSimplux(counter.plus, 5)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value + 5: {valuePlusFive}</span>
      <br />
      <button onClick={counter.increment}>Increment</button>
      <br />
      <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
    </>
  )
}

const App = () => (
  <SimpluxProvider>
    <Counter />
  </SimpluxProvider>
)

render(<App />, document.getElementById('root'))
```

See this example in action [here](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/quickstart/react). For a more detailed look into how simplux can make your life simple follow our recipe for [getting started](../../basics/getting-started#readme).

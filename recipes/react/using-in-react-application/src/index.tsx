// this code is part of the simplux recipe "using simplux in my React application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-in-react-application

import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'
import { SimpluxProvider, useSimplux } from '@simplux/react'
import React from 'react'
import { render } from 'react-dom'

// let's create a simple counter module
const counterModule = createSimpluxModule('counter', { value: 0 })

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

// now we can start using our module in our React components

const Counter = () => {
  // to access a module's state we can use the `useSimplux` hook; this
  // hook takes a module selector (plus its extra arguments if any) and
  // evaluates it with the module's current state; the hook also ensures
  // that the component is updated whenever the selected value changes
  const value = useSimplux(counter.value)

  // provide any arguments for the selector directly to the hook
  const valueTimesThree = useSimplux(counter.valueTimes, 3)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value * 3: {valueTimesThree}</span>
      <br />
      {/* we can use mutations directly as event handlers */}
      <button onClick={counter.increment}>Increment</button>
      <br />
      {/* we can also use mutations with arguments */}
      <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
    </>
  )
}

// lastly, we have to surround our application root component with a provider
const App = () => (
  <SimpluxProvider>
    <Counter />
  </SimpluxProvider>
)

render(<App />, document.getElementById('root'))

// finally, if you want or need your component to be a class component
// (and therefore cannot use hooks directly) we recommend that you
// build a functional wrapper component with `useSimplux` to select
// the state your component requires and pass it to your class component
// as props; mutations can be used directly in class components just
// like in functional components; let's have a look at how our counter
// component would look like as a class component

interface CounterProps {
  value: number
  valueTimesThree: number
}

class CounterComponent extends React.Component<CounterProps> {
  render() {
    const { value, valueTimesThree } = this.props

    return (
      <>
        <span>value: {value}</span>
        <br />
        <span>value * 3: {valueTimesThree}</span>
        <br />
        {/* mutations can still be used directly */}
        <button onClick={counter.increment}>Increment</button>
        <br />
        <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
      </>
    )
  }
}

export const CounterWrapper = () => {
  const value = useSimplux(counter.value)
  const valueTimesThree = useSimplux(counter.valueTimes, 3)
  const props = { value, valueTimesThree }
  return <CounterComponent {...props} />
}

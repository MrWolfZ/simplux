// this code is part of the simplux recipe "using simplux in my React application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-in-react-application

import { createMutations, createSimpluxModule } from '@simplux/core'
import { createSelectorHook } from '@simplux/react'
import { createSelectors } from '@simplux/selectors'
import React from 'react'
import { render } from 'react-dom'

// let's create a simple counter module

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

// the simplux react extension adds function that creates a React
// hook which allows using a module's state in a component
const useCounter = createSelectorHook(counterModule)

// now we can start using our module in our React components

const Counter = () => {
  // as the name of the createSelectorHook function suggests the created
  // useCounter hook allows us to use our module's selectors inside our
  // component; this hook also ensures that the component is updated
  // whenever the selected value changes
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

render(<Counter />, document.getElementById('root'))

// finally, if you do want or need your component to be a class
// component (and therefore cannot use hooks) we recommend that
// you build a functional wrapper component that uses module
// selector hooks to select the state your component requires and
// passes it to your class component as props; note that mutations
// can be used directly in class components; let's have a look at
// how our counter component would look like as a class component

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

export const CounterWrapper = () => {
  const value = useCounter(selectCounterValue)
  const valueTimesTwo = useCounter(s => s.value * 2)
  const valueTimesFive = useCounter(selectCounterValueTimes.asFactory(5))

  const props = { value, valueTimesTwo, valueTimesFive }
  return <CounterComponent {...props} />
}

// this code is part of the simplux recipe "using simplux in my React application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-in-react-application

import { createSimpluxModule } from '@simplux/core'
// we import all the simplux extension packages we are going to use
import '@simplux/immer'
import '@simplux/react'
import '@simplux/selectors'
import React from 'react'
import { render } from 'react-dom'

// let's create a simple counter module

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

const { selectCounterValue, selectCounterValueTimes } = createSelectors({
  selectCounterValue: ({ value }) => value,

  selectCounterValueTimes: ({ value }, multiplier: number) =>
    value * multiplier,
})

// now we can start using our module in our React components

const Counter = () => {
  // as the name suggests the useSelector hook allows us to use our
  // module's selectors inside our component; this hook ensures that
  // the component is updated whenever the selected value changes
  const value = useSelector(selectCounterValue)

  // the selector can be defined inline
  const valueTimesTwo = useSelector(s => s.value * 2)

  // and for selectors that take additional arguments we can call it
  // as a factory to create a new selector for only the state
  const valueTimesFive = useSelector(selectCounterValueTimes.asFactory(5))

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

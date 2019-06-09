// this code is part of the simplux recipe "using simplux in my React application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/using-in-react-application

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

const { selectCounterValue } = createSelectors({
  selectCounterValue: ({ value }) => value,
})

// now we can start using our module in our React components

const Counter = () => {
  // as the name suggests the useSelector hook allows us to use our
  // module's selectors inside our component; this hook ensures that
  // the component is updated whenever the selected value changes
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

render(<Counter />, document.getElementById('root'))

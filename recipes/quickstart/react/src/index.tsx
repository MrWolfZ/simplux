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

// this code is part of the simplux recipe "testing my React components":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-component

import { useSimplux } from '@simplux/react'
import React from 'react'
import { counter } from './counter-module'

export const Counter = () => {
  const value = useSimplux(counter.value)
  const valueTimesThree = useSimplux(counter.valueTimes, 3)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value * 3: {valueTimesThree}</span>
      <br />
      <button onClick={counter.increment}>Increment</button>
      <br />
      <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
    </>
  )
}

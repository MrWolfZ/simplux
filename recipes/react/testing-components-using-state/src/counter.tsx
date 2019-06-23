// this code is part of the simplux recipe "testing my React components that read and change state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state

import React from 'react'
import {
  increment,
  incrementBy,
  selectCounterValue,
  selectCounterValueTimes,
  useCounter,
} from './counter-module'

export const Counter = () => {
  const value = useCounter(selectCounterValue)
  const valueTimesTwo = useCounter(s => s.value * 2)
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
      <button onClick={increment}>Increment</button>
      <br />
      <button onClick={() => incrementBy(5)}>Increment by 5</button>
    </>
  )
}

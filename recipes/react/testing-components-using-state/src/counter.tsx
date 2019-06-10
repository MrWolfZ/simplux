import React from 'react'
import {
  increment,
  incrementBy,
  selectCounterValue,
  useCounter,
} from './counter-module'

export const Counter = () => {
  const value = useCounter(selectCounterValue)
  const valueTimesTwo = useCounter(s => s.value * 2)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value * 2: {valueTimesTwo}</span>
      <br />
      <button onClick={increment}>Increment</button>
      <button onClick={() => incrementBy(5)}>Increment by 5</button>
    </>
  )
}

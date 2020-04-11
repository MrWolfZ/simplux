// this code is part of the simplux recipe "using lazy loaded React components/code splitting":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-lazy-loading-code-splitting

import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'
import { useSimplux } from '@simplux/react'
import React from 'react'

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

export const Counter = () => {
  const value = useSimplux(counter.value)

  return (
    <>
      <span>value: {value}</span>
      <button onClick={counter.increment}>Increment</button>
    </>
  )
}

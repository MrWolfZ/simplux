// this code is part of the simplux recipe "using lazy loaded React components/code splitting":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/using-lazy-loading-code-splitting

import { createMutations, createSelectors, createSimpluxModule } from '@simplux/core'
import { useSimplux } from '@simplux/react'
import React from 'react'

const lazyCounterModule = createSimpluxModule('lazyCounter', { value: 0 })

const lazyCounter = {
  ...lazyCounterModule,
  ...createMutations(lazyCounterModule, {
    increment(state) {
      state.value += 1
    },
  }),
  ...createSelectors(lazyCounterModule, {
    value: ({ value }) => value,
  }),
}

const LazyCounter = () => {
  const value = useSimplux(lazyCounter.value)

  return (
    <>
      <span>lazy value: {value}</span>
      <button onClick={lazyCounter.increment}>Increment</button>
    </>
  )
}

export default LazyCounter

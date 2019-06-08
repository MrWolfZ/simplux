// this code is part of the simplux recipe "testing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state

import { createSimpluxModule } from '@simplux/core'

const { getState, setState, createSelectors } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

export const getCounterState = getState
export const setCounterState = setState

export const { plusOne, plus } = createSelectors({
  plusOne: ({ counter }) => counter + 1,
  plus: ({ counter }, amount: number) => counter + amount,
})

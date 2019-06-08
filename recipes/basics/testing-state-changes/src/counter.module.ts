// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import { createSimpluxModule } from '@simplux/core'

const { getState, setState, createMutations } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

export const getCounterState = getState
export const setCounterState = setState

export const { increment, incrementBy } = createMutations({
  increment: state => ({ ...state, counter: state.counter + 1 }),
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})

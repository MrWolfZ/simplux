// this code is part of the simplux recipe "testing my React components that read and change state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state

import { createSimpluxModule } from '@simplux/core'

const {
  getState,
  setState,
  createMutations,
  createSelectors,
  react: {
    hooks: { useSelector },
  },
} = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

export const getCounterValue = () => getState().value
export const setCounterValue = (value: number) => setState({ value })
export const useCounter = useSelector

export const { increment, incrementBy } = createMutations({
  increment(state) {
    state.value += 1
  },

  incrementBy(state, amount: number) {
    state.value += amount
  },
})

export const { selectCounterValue, selectCounterValueTimes } = createSelectors({
  selectCounterValue: ({ value }) => value,

  selectCounterValueTimes: ({ value }, multiplier: number) =>
    value * multiplier,
})

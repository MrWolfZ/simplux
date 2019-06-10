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

export const { selectCounterValue } = createSelectors({
  selectCounterValue: ({ value }) => value,
})

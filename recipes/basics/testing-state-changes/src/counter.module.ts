import { createSimpluxModule } from '@simplux/core'

const { setState, createMutations } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

export const setCounterState = setState

export const { increment, incrementBy } = createMutations({
  increment: state => ({ ...state, counter: state.counter + 1 }),
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})

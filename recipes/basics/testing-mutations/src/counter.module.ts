import { createSimpluxModule } from '@simplux/core'

// now we create our module and destructure it into all
// the functions we are going to use
const { getState, setState, createMutations } = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

export const getCounterState = getState
export const setCounterState = setState

// instead of directly setting the state, usually it is better
// to define mutations
export const { increment, incrementBy } = createMutations({
  increment: state => ({ ...state, counter: state.counter + 1 }),
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})

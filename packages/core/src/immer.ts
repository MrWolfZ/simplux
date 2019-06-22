import { produce } from 'immer'
import { Reducer } from 'redux'

export function createImmerReducer<TState>(
  wrappedMutatingReducer: Reducer<TState>,
): Reducer<TState> {
  let reducerActivationSemaphore = 0

  return (state, action) => {
    reducerActivationSemaphore += 1

    if (!state) {
      state = wrappedMutatingReducer(state, { type: '@simplux/immer/init' })
    }

    if (reducerActivationSemaphore === 1) {
      state = produce(state, draft =>
        wrappedMutatingReducer(draft as TState, action),
      ) as TState
    } else {
      state = wrappedMutatingReducer(state, action)
    }

    reducerActivationSemaphore -= 1

    return state
  }
}

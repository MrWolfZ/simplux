import { SimpluxModuleExtension } from '@simplux/core'
import { produce } from 'immer'
import { Reducer } from 'redux'

export interface ImmerMutationReturnTypeOverride<TState> {
  returnType: TState | void
}

declare module '@simplux/core/src/mutations' {
  interface MutationReturnTypeOverride<TState>
    extends ImmerMutationReturnTypeOverride<TState> {}
}

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

export const immerModuleExtension: SimpluxModuleExtension<any> = (
  { name },
  { getReducer, setReducer },
) => {
  setReducer(name, createImmerReducer<any>(getReducer(name)))
  return {}
}

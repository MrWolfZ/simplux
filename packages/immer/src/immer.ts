import { SimpluxModuleExtension } from '@simplux/core'
import { produce } from 'immer'
import { Reducer } from 'redux'

declare module '@simplux/core/src/mutations' {
  interface MutationReturnTypeOverride<TState> {
    returnType: TState | void
  }
}

export function createImmerReducer<TState>(
  wrappedMutatingReducer: Reducer<TState>,
): Reducer<TState> {
  return (state, action) => {
    if (!state) {
      state = wrappedMutatingReducer(state, { type: '@simplux/immer/init' })
    }

    return produce(state, draft =>
      wrappedMutatingReducer(draft as TState, action),
    ) as TState
  }
}

export const immerModuleExtension: SimpluxModuleExtension<any> = (
  { name },
  { getReducer, setReducer },
) => {
  setReducer(name, createImmerReducer<any>(getReducer(name)))
  return {}
}

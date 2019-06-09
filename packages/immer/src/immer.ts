import { SimpluxModuleExtension } from '@simplux/core'
import { produce } from 'immer'
import { AnyAction, Reducer } from 'redux'

export interface ImmerMutationReturnTypeOverride<TState> {
  returnType: TState | void
}

declare module '@simplux/core/src/mutations' {
  interface MutationReturnTypeOverride<TState>
    extends ImmerMutationReturnTypeOverride<TState> {}
}

// this interface describes a behaviour by the core module that allows
// specifying the freezing behaviour when executing the reducer
type CustomReducer<TState = any> = (
  state: TState | undefined,
  action: AnyAction,
  storeShouldBeFrozenDuringMutations?: () => boolean,
) => TState

export function createImmerReducer<TState>(
  wrappedMutatingReducer: Reducer<TState>,
): Reducer<TState> {
  const customReducer: CustomReducer<TState> = wrappedMutatingReducer

  let reducerActivationSemaphore = 0

  return (state, action) => {
    reducerActivationSemaphore += 1

    if (!state) {
      state = customReducer(state, { type: '@simplux/immer/init' })
    }

    if (reducerActivationSemaphore === 1) {
      state = produce(state, draft =>
        customReducer(draft as TState, action, () => false),
      ) as TState
    } else {
      state = customReducer(state, action, () => false)
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

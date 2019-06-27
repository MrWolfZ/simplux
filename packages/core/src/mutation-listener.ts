import produce from 'immer'
import { SimpluxModule, SimpluxModuleInternals } from './module'
import { ResolvedMutationInternals } from './mutations'

export type MutationListener<TState, TArgs extends any[]> = (
  state: TState,
  ...args: TArgs
) => TState | void

export type ResolvedMutationListener<TState, TArgs extends any[]> = (
  state: TState,
  ...args: TArgs
) => TState

export interface MutationListenerSubscription<TState, TArgs extends any[]> {
  stopListening: () => void
  listener: ResolvedMutationListener<TState, TArgs>
}

export interface MutationListeners<TState> {
  [mutationType: string]: MutationListener<TState, any>
}

/**
 * Listen to the mutation of another module. When the mutation is executed
 * the provided listener will be called with listening module's current state
 * as well as the mutation's argument to update the listening module's state.
 *
 * @param simpluxModule the module that listens to the mutation
 * @param mutation the mutation to listen to
 * @param listener the listener that is called to update the listening
 * module's state when the mutation is executed
 *
 * @returns an object containing a callback to stop listening to the mutation
 * as well as the listener itself (which is useful for testing)
 */
export function listenToMutation<TState, TArgs extends any[]>(
  simpluxModule: SimpluxModule<TState>,
  mutation: ((...args: TArgs) => any) & { type: string },
  listener: MutationListener<TState, TArgs>,
): MutationListenerSubscription<TState, TArgs> {
  const mutationInternals = (mutation as unknown) as ResolvedMutationInternals<
    TState
  >

  const {
    extensionStateContainer,
  } = (simpluxModule as unknown) as SimpluxModuleInternals

  const mutationListeners = extensionStateContainer.mutationListeners as MutationListeners<
    TState
  >

  if (mutationInternals.owningModule === simpluxModule) {
    throw new Error(
      `you cannot listen to mutation '${
        mutationInternals.mutationName
      }' of module '${simpluxModule.name}' since it belongs to the same module`,
    )
  }

  if (mutationListeners[mutation.type]) {
    throw new Error(
      `mutation listener for mutation '${
        mutationInternals.mutationName
      }' of module '${
        mutationInternals.owningModule.name
      }' is already defined for module '${simpluxModule.name}'`,
    )
  }

  mutationListeners[mutation.type] = listener

  function unsubscribe() {
    delete mutationListeners[mutation.type]
  }

  function resolvedListener(state: TState, ...args: TArgs) {
    return produce(state, draft => listener(draft as TState, ...args)) as TState
  }

  return {
    stopListening: unsubscribe,
    listener: resolvedListener,
  }
}

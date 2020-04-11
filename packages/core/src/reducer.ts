import { Immutable } from 'immer'
import { Action } from 'redux'
import { createMutationPrefix, MutationDefinitions } from './mutations'

export function createModuleReducer<TState>(
  moduleName: string,
  initialState: Immutable<TState>,
  moduleMutations: MutationDefinitions<TState>,
) {
  const mutationPrefix = createMutationPrefix(moduleName)

  return <TAction extends Action<string>>(
    state = initialState,
    action: TAction,
  ): Immutable<TState> => {
    if (action.type.startsWith(mutationPrefix)) {
      const { mutationName, args } = action as any
      const mutation = moduleMutations[mutationName]

      if (process.env.NODE_ENV !== 'production') {
        if (!mutation) {
          throw new Error(
            `mutation '${mutationName}' does not exist in module '${moduleName}'`,
          )
        }
      }

      return (mutation(state as TState, ...args) as Immutable<TState>) || state
    }

    if (action.type === `@simplux/${moduleName}/setState`) {
      return (action as any).state
    }

    return state
  }
}

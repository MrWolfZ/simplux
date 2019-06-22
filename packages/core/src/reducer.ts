import { Action } from 'redux'
import { createMutationPrefix, MutationsBase } from './mutations'

export function createModuleReducer<TState>(
  moduleName: string,
  initialState: TState,
  moduleMutations: MutationsBase<TState>,
) {
  const mutationPrefix = createMutationPrefix(moduleName)

  return <TAction extends Action<string>>(
    state = initialState,
    action: TAction,
  ): TState => {
    if (action.type.startsWith(mutationPrefix)) {
      const { mutationName, args } = action as any
      const mutation = moduleMutations[mutationName]

      if (!mutation) {
        throw new Error(
          `mutation '${mutationName}' does not exist in module '${moduleName}'`,
        )
      }

      return mutation(state, ...args) || state
    }

    if (action.type === `@simplux/${moduleName}/setState`) {
      return (action as any).state
    }

    return state
  }
}

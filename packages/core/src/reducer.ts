import type { Action } from 'redux'
import type { MutationDefinitions } from './mutations.js'

/**
 * @internal
 */
export function createModuleReducer<TState>(
  moduleName: string,
  initialState: TState,
  moduleMutations: MutationDefinitions<TState>,
) {
  const mutationPrefix = `@simplux/${moduleName}/mutation/`

  return <TAction extends Action<string>>(
    state = initialState,
    action: TAction,
  ): TState => {
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

      return mutation?.(state, ...args) || state
    }

    if (action.type === `@simplux/${moduleName}/setState`) {
      return (action as any).state
    }

    return state
  }
}

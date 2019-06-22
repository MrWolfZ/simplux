import { Action } from 'redux'
import { createMutationPrefix, MutationsBase } from './mutations'

const getIsDevelopmentMode = () =>
  process.env && process.env.NODE_ENV === 'development'

export function createModuleReducer<TState>(
  moduleName: string,
  initialState: TState,
  moduleMutations: MutationsBase<TState>,
) {
  const mutationPrefix = createMutationPrefix(moduleName)

  return <TAction extends Action<string>>(
    state = initialState,
    action: TAction,

    // this third non-standard argument only exists to allow the immer extension
    // to override the freezing behaviour; it is a getter function instead of a
    // boolean to allow testing the different behaviours during testing by
    // changing the environment
    storeShouldBeFrozenDuringMutations = getIsDevelopmentMode,
  ): TState => {
    if (action.type.startsWith(mutationPrefix)) {
      const { mutationName, args } = action as any
      const mutation = moduleMutations[mutationName]

      if (!mutation) {
        throw new Error(
          `mutation '${mutationName}' does not exist in module '${moduleName}'`,
        )
      }

      if (storeShouldBeFrozenDuringMutations()) {
        state = Object.freeze(state)
      }

      return mutation(state, ...args) || state
    }

    if (action.type === `@simplux/${moduleName}/setState`) {
      return (action as any).state
    }

    return state
  }
}

import { Action, Dispatch } from 'redux'
import { SimpluxModuleExtension } from './module'

// this interface exists purely to allow plugins to overwrite the return type of mutations
// @ts-ignore
export interface MutationReturnTypeOverride<TState> {}

export type MutationReturnType<TState> = MutationReturnTypeOverride<
  TState
> extends { returnType: infer TReturn }
  ? TReturn
  : TState

export type MutationBase<TState> = (
  state: TState,
  // optimally, we would use ...args: any[] but that does not work correctly with
  // TypeScript 3.3.3 so we use this workaround
  arg1?: any,
  arg2?: any,
  arg3?: any,
  arg4?: any,
  arg5?: any,
  arg6?: any,
  arg7?: any,
  arg8?: any,
  arg9?: any,
) => MutationReturnType<TState>

export interface MutationsBase<TState> {
  [name: string]: MutationBase<TState>
}

export interface ResolvedMutationExtras<TState, TArgs extends any[]> {
  /**
   * When a mutation is called directly it updates the module's state.
   * Sometimes (e.g. for testing) it is useful to call the mutation
   * with a given state. In this case no changes are made to the module.
   */
  withState: (state: TState) => (...args: TArgs) => TState

  /**
   * When a mutation is called directly it updates the module's state by
   * dispatching a redux action to the store. Sometimes it is useful to
   * instead handle the action yourself instead of having simplux dispatch
   * it automatically. This function returns the redux action instead of
   * dispatching it.
   */
  asActionCreator: (...args: TArgs) => { type: string; args: TArgs }
}

export type ResolvedMutation<
  TState,
  TMutation extends MutationBase<TState>
> = TMutation extends (state: TState, ...args: infer TArgs) => TState | void
  ? ((...args: TArgs) => TState) & ResolvedMutationExtras<TState, TArgs>
  : never

export type ResolvedMutations<
  TState,
  TMutations extends MutationsBase<TState>
> = { [name in keyof TMutations]: ResolvedMutation<TState, TMutations[name]> }

export type MutationsFactory<TState> = <
  TMutations extends MutationsBase<TState>
>(
  mutations: TMutations,
) => ResolvedMutations<TState, TMutations>

const mutationPrefix = (moduleName: string) =>
  `@simplux/${moduleName}/mutation/`

export function createModuleReducer<TState>(
  moduleName: string,
  initialState: TState,
  moduleMutations: MutationsBase<TState>,
) {
  return <TAction extends Action<string>>(
    state = initialState,
    action: TAction,
  ): TState => {
    if (action.type.startsWith(mutationPrefix(moduleName))) {
      const mutationName = action.type.replace(mutationPrefix(moduleName), '')
      const mutation = moduleMutations[mutationName]

      if (!mutation) {
        throw new Error(
          `mutation '${mutationName}' does not exist in module '${moduleName}'`,
        )
      }

      return mutation(state, ...(action as any).args) || state
    }

    if (action.type === `@simplux/${moduleName}/setState`) {
      return (action as any).state
    }

    return state
  }
}

// this helper function allows creating a function with a dynamic name
function nameFunction<T extends (...args: any[]) => any>(
  name: string,
  body: T,
): T {
  return {
    [name](...args: any[]) {
      return body(...args)
    },
  }[name] as T
}

export function createMutationsFactory<TState>(
  moduleName: string,
  getModuleState: () => TState,
  dispatch: Dispatch,
  moduleMutations: MutationsBase<TState>,
): MutationsFactory<TState> {
  return <TMutations extends MutationsBase<TState>>(
    mutations: TMutations,
  ): ResolvedMutations<TState, TMutations> => {
    for (const mutationName of Object.keys(mutations)) {
      if (moduleMutations[mutationName]) {
        throw new Error(
          `mutation '${mutationName}' is already defined for module '${moduleName}'`,
        )
      }
    }

    Object.assign(moduleMutations, mutations)

    const resolvedMutations = Object.keys(mutations).reduce(
      (acc, mutationName: keyof TMutations) => {
        const createAction = (...args: any[]) => ({
          type: `${mutationPrefix(moduleName)}${mutationName}`,
          args,
        })

        const mutation = nameFunction(
          mutationName as string,
          (...args: any[]) => {
            dispatch(createAction(...args))
            return getModuleState()
          },
        ) as ResolvedMutation<TState, TMutations[typeof mutationName]>

        acc[mutationName] = mutation

        acc[mutationName].withState = (state: TState) => (...args: any[]) => {
          const result = mutations[mutationName](state, ...args)
          return result || state
        }

        acc[mutationName].asActionCreator = createAction as any

        return acc
      },
      {} as ResolvedMutations<TState, TMutations>,
    )

    return resolvedMutations
  }
}

export interface SimpluxModuleMutationExtensions<TState> {
  /**
   * Create new mutations for the module. A mutation is a function
   * that takes the module state and optionally additional parameters
   * and returns an updated version of the state.
   *
   * @param mutations the mutations to create
   *
   * @returns an object that contains a function for each provided
   * mutation which when called will execute the mutation on the module
   */
  createMutations: MutationsFactory<TState>
}

declare module './module' {
  interface SimpluxModule<TState>
    extends SimpluxModuleMutationExtensions<TState> {}
}

export const mutationsModuleExtension: SimpluxModuleExtension<
  SimpluxModuleMutationExtensions<any>
> = (
  { name, initialState },
  { dispatch, setReducer },
  { getState },
  extensionState,
) => {
  extensionState.mutations = extensionState.mutations || {}
  extensionState.mutations[name] = extensionState.mutations[name] || {}
  const reducer = createModuleReducer(
    name,
    initialState,
    extensionState.mutations[name],
  )

  setReducer(name, reducer)

  return {
    createMutations: createMutationsFactory(
      name,
      getState,
      dispatch,
      extensionState.mutations[name],
    ),
  }
}

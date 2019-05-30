import { Action } from 'redux'
import { SimpluxModuleExtension } from './module'
import { SimpluxStore } from './store'

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
  ...args: any[]
) => MutationReturnType<TState>

export interface MutationsBase<TState> {
  [name: string]: MutationBase<TState>
}

export interface ResolvedMutationExtras<TState, TArgs extends any[]> {
  withState: (state: TState) => (...args: TArgs) => TState
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

export function createMutationsFactory<TState>(
  moduleName: string,
  { getState, dispatch }: SimpluxStore,
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

        acc[mutationName] = ((...args: any[]) => {
          dispatch(createAction(...args))
          return getState()[moduleName]
        }) as ResolvedMutation<TState, TMutations[typeof mutationName]>
        acc[mutationName].withState = (state: TState) => (...args: any[]) => {
          const result = mutations[mutationName](state, ...args)
          return result || state
        }
        acc[mutationName].asActionCreator = createAction
        return acc
      },
      {} as ResolvedMutations<TState, TMutations>,
    )

    return resolvedMutations
  }
}

export interface SimpluxModuleMutationExtensions<TState> {
  createMutations: MutationsFactory<TState>
}

declare module './module' {
  interface SimpluxModule<TState>
    extends SimpluxModuleMutationExtensions<TState> {}
}

export const mutationsModuleExtension: SimpluxModuleExtension<
  SimpluxModuleMutationExtensions<any>
> = ({ name, initialState }, store, extensionState) => {
  extensionState.mutations = extensionState.mutations || {}
  extensionState.mutations[name] = extensionState.mutations[name] || {}
  const reducer = createModuleReducer(
    name,
    initialState,
    extensionState.mutations[name],
  )

  store.setReducer(name, reducer)

  return {
    createMutations: createMutationsFactory(
      name,
      store,
      extensionState.mutations[name],
    ),
  }
}

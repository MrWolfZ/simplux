import { Action } from 'redux'
import { SimpluxModuleExtension } from './module'
import { ReduxStoreProxy } from './store'

// this interface exists purely to allow plugins to overwrite the return type of mutations
// @ts-ignore
export interface MutationReturnTypeOverride<TState> { }

export type MutationReturnType<TState> = MutationReturnTypeOverride<TState> extends { returnType: infer TReturn } ? TReturn : TState

export type MutationBase<TState> = (state: TState, ...args: any[]) => MutationReturnType<TState>

export interface MutationsBase<TState> { [name: string]: MutationBase<TState> }

export interface ResolvedMutationExtras<TState, TArgs extends any[]> {
  withState: (state: TState) => (...args: TArgs) => TState
}

export type ResolvedMutation<TState, TMutation extends MutationBase<TState>> =
  TMutation extends (state: TState, ...args: infer TArgs) => (TState | void)
  ? ((...args: TArgs) => TState) & ResolvedMutationExtras<TState, TArgs>
  : never

export type ResolvedMutations<TState, TMutations extends MutationsBase<TState>> = {
  [name in keyof TMutations]: ResolvedMutation<TState, TMutations[name]>
}

export type MutationsFactory<TState> = <TMutations extends MutationsBase<TState>>(mutations: TMutations) => ResolvedMutations<TState, TMutations>

const mutationPrefix = (moduleName: string) => `@simplux/${moduleName}/mutation/`

export function createModuleReducer<TState>(moduleName: string, initialState: TState, moduleMutations: MutationsBase<TState>) {
  return <TAction extends Action<string>>(state = initialState, action: TAction): TState => {
    if (action.type.startsWith(mutationPrefix(moduleName))) {
      const mutationName = action.type.replace(mutationPrefix(moduleName), '')
      const mutation = moduleMutations[mutationName]

      if (!mutation) {
        throw new Error(`mutation '${mutationName}' does not exist in module '${moduleName}'`)
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
  { getState, dispatch }: ReduxStoreProxy,
  moduleMutations: MutationsBase<TState>,
): MutationsFactory<TState> {
  return <TMutations extends MutationsBase<TState>>(mutations: TMutations): ResolvedMutations<TState, TMutations> => {
    Object.assign(moduleMutations, mutations)

    const resolvedMutations = Object.keys(mutations).reduce((acc, mutationName: keyof TMutations) => {
      acc[mutationName] = ((...args: any[]) => {
        dispatch({ type: `${mutationPrefix(moduleName)}${mutationName}`, args })
        return getState()[moduleName]
      }) as ResolvedMutation<TState, TMutations[typeof mutationName]>
      acc[mutationName].withState = (state: TState) => (...args: any[]) => {
        const result = mutations[mutationName](state, ...args)
        return result || state
      }
      return acc
    }, {} as ResolvedMutations<TState, TMutations>)

    return resolvedMutations
  }
}

export interface SimpluxModuleMutationExtensions<TState> {
  createMutations: MutationsFactory<TState>
}

declare module './module' {
  interface SimpluxModule<TState> extends SimpluxModuleMutationExtensions<TState> { }
}

export const mutationsModuleExtension: SimpluxModuleExtension<SimpluxModuleMutationExtensions<any>> = (
  { name, initialState },
  storeProxy,
  moduleExtensionStateContainer,
) => {
  moduleExtensionStateContainer.mutations = moduleExtensionStateContainer.mutations || {}
  const moduleMutations: MutationsBase<unknown> = moduleExtensionStateContainer.mutations[name] = moduleExtensionStateContainer.mutations[name] || {}
  const reducer = createModuleReducer(name, initialState, moduleMutations)
  storeProxy.setChildReducer(name, reducer)
  return {
    createMutations: createMutationsFactory(name, storeProxy, moduleMutations),
  }
}

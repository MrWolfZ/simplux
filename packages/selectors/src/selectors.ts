import { SimpluxModuleExtension } from '@simplux/core'

export type SelectorBase<TState, TReturn> = (
  state: TState,
  ...args: any[]
) => TReturn

export interface SelectorsBase<TState> {
  [name: string]: SelectorBase<TState, any>
}

export interface ResolvedSelectorExtras<TArgs extends any[], TReturn> {
  bound: (...args: TArgs) => TReturn
}

export type ResolvedSelector<
  TState,
  TSelector extends SelectorBase<TState, ReturnType<TSelector>>
> = TSelector extends (state: TState, ...args: infer TArgs) => infer TReturn
  ? ((state: TState, ...args: TArgs) => TReturn) &
      ResolvedSelectorExtras<TArgs, TReturn>
  : never

export type ResolvedSelectors<
  TState,
  TSelectors extends SelectorsBase<TState>
> = { [name in keyof TSelectors]: ResolvedSelector<TState, TSelectors[name]> }

export type SelectorsFactory<TState> = <
  TSelectors extends SelectorsBase<TState>
>(
  selectors: TSelectors,
) => ResolvedSelectors<TState, TSelectors>

export function createSelectorsFactory<TState>(
  moduleName: string,
  getStoreState: () => any,
  moduleSelectors: SelectorsBase<TState>,
): SelectorsFactory<TState> {
  return <TSelectors extends SelectorsBase<TState>>(
    selectors: TSelectors,
  ): ResolvedSelectors<TState, TSelectors> => {
    for (const selectorName of Object.keys(selectors)) {
      if (moduleSelectors[selectorName]) {
        throw new Error(
          `selector '${selectorName}' is already defined for module '${moduleName}'`,
        )
      }
    }

    Object.assign(moduleSelectors, selectors)

    const resolvedSelectors = Object.keys(selectors).reduce(
      (acc, key) => {
        const selector = moduleSelectors[key]
        acc[key] = ((state: TState, ...args: any[]) => {
          return selector(state, ...args)
        }) as ResolvedSelector<TState, TSelectors[typeof key]>
        acc[key].bound = ((...args: any[]) => {
          return selector(getStoreState()[moduleName], ...args)
        }) as ResolvedSelector<TState, TSelectors[typeof key]>
        return acc
      },
      {} as ResolvedSelectors<TState, TSelectors>,
    )

    return resolvedSelectors
  }
}

export interface SimpluxModuleSelectorExtensions<TState> {
  createSelectors: SelectorsFactory<TState>
}

declare module '@simplux/core' {
  export interface SimpluxModule<TState>
    extends SimpluxModuleSelectorExtensions<TState> {}
}

export const selectorsModuleExtension: SimpluxModuleExtension<
  SimpluxModuleSelectorExtensions<any>
> = ({ name }, { getState }, moduleExtensionStateContainer) => {
  moduleExtensionStateContainer.selectors =
    moduleExtensionStateContainer.selectors || {}
  const moduleSelectors: SelectorsBase<
    unknown
  > = (moduleExtensionStateContainer.selectors[name] =
    moduleExtensionStateContainer.selectors[name] || {})
  return {
    createSelectors: createSelectorsFactory(name, getState, moduleSelectors),
  }
}

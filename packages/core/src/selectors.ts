import { SimpluxModule, SimpluxModuleInternals } from '@simplux/core'

export type SelectorBase<TState, TReturn> = (
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
) => TReturn

export interface SelectorsBase<TState> {
  [name: string]: SelectorBase<TState, any>
}

export interface ResolvedSelectorExtras<TState, TArgs extends any[], TReturn> {
  /**
   * By default a selector needs to be provided the module's state and arguments.
   * However, sometimes it is useful to automatically bind the selector to the
   * module's latest state and only provide the additional arguments. This function
   * will do just that.
   *
   * @param args the additional arguments for the selector
   *
   * @returns the selected value
   */
  withLatestModuleState: (...args: TArgs) => TReturn

  /**
   * This function takes only the additional arguments for a selector and returns
   * a new selector that takes only the state itself as an argument.
   *
   * @param args the additional arguments for the selector
   *
   * @returns a new selector that takes only the state as an argument
   */
  asFactory: (...args: TArgs) => (state: TState) => TReturn
}

export type ResolvedSelector<
  TState,
  TSelector extends SelectorBase<TState, ReturnType<TSelector>>
> = TSelector extends (state: TState, ...args: infer TArgs) => infer TReturn
  ? ((state: TState, ...args: TArgs) => TReturn) &
      ResolvedSelectorExtras<TState, TArgs, TReturn>
  : never

export type ResolvedSelectors<
  TState,
  TSelectors extends SelectorsBase<TState>
> = { [name in keyof TSelectors]: ResolvedSelector<TState, TSelectors[name]> }

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

export interface SelectorsExtensionStateContainer<TState> {
  [moduleName: string]: SelectorsBase<TState>
}

/**
 * Create new selectors for the module. A selector is a function
 * that takes the module state and optionally additional parameters
 * and returns some selected value.
 *
 * The selector must be a pure function. Its result is memoized
 * for the latest state and parameters.
 *
 * @param simpluxModule the module to create selectors for
 * @param selectors the selectors to create
 *
 * @returns an object that contains a function for each provided
 * selector
 */
export function createSelectors<
  TState,
  TSelectors extends SelectorsBase<TState>
>(
  simpluxModule: SimpluxModule<TState>,
  selectors: TSelectors,
): ResolvedSelectors<TState, TSelectors> {
  const moduleName = simpluxModule.name
  const {
    extensionStateContainer,
  } = (simpluxModule as any) as SimpluxModuleInternals

  const selectorsContainer = (extensionStateContainer.selectors ||
    {}) as SelectorsExtensionStateContainer<TState>

  extensionStateContainer.selectors = selectorsContainer

  const moduleSelectors = (selectorsContainer[moduleName] =
    selectorsContainer[moduleName] || {})

  for (const selectorName of Object.keys(selectors)) {
    if (moduleSelectors[selectorName]) {
      throw new Error(
        `selector '${selectorName}' is already defined for module '${moduleName}'`,
      )
    }
  }

  Object.assign(moduleSelectors, selectors)

  const resolvedSelectors = Object.keys(selectors).reduce(
    (acc, selectorName: keyof TSelectors) => {
      const getSelector = () => moduleSelectors[selectorName as string]

      const namedSelector = nameFunction(
        selectorName as string,
        (state: TState, ...args: any[]) => {
          return getSelector()(state, ...args)
        },
      ) as ResolvedSelector<TState, TSelectors[typeof selectorName]>

      acc[selectorName] = namedSelector

      acc[selectorName].withLatestModuleState = (...args: any[]) => {
        return getSelector()(simpluxModule.getState(), ...args)
      }

      acc[selectorName].asFactory = (...args: any[]) => (state: TState) => {
        return getSelector()(state, ...args)
      }

      return acc
    },
    {} as ResolvedSelectors<TState, TSelectors>,
  )

  return resolvedSelectors
}

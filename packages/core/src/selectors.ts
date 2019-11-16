import { SimpluxModule } from './module'

export type SelectorDefinition<TState, TReturn> = (
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

export interface SelectorDefinitions<TState> {
  [name: string]: SelectorDefinition<TState, any>
}

export interface SimpluxSelectorMarker {
  $simpluxType: 'selector'
}

export interface SimpluxSelector<TState, TArgs extends any[], TReturn>
  extends SimpluxSelectorMarker {
  /**
   * Evalute the selector with the module's latest state.
   *
   * @param args the arguments for the selector
   *
   * @returns the selected value
   */
  (...args: TArgs): TReturn

  /**
   * By default a selector is evaluated with the module's latest state.
   * This function evaluates the selector with the given state instead.
   *
   * @param state the state to use when evaluating the selector
   * @param args the arguments for the selector
   *
   * @returns the selected value
   */
  withState: (state: TState, ...args: TArgs) => TReturn

  /**
   * The module this selector belongs to.
   */
  owningModule: SimpluxModule<TState>
}

export type ResolvedSelector<
  TState,
  TSelectorDefinition extends SelectorDefinition<
    TState,
    ReturnType<TSelectorDefinition>
  >
> = TSelectorDefinition extends (
  state: TState,
  ...args: infer TArgs
) => infer TReturn
  ? SimpluxSelector<TState, TArgs, TReturn>
  : never

export type ResolvedSelectors<
  TState,
  TSelectorDefinitions extends SelectorDefinitions<TState>
> = {
  [name in keyof TSelectorDefinitions]: ResolvedSelector<
    TState,
    TSelectorDefinitions[name]
  >
}

// this helper function allows creating a function with a dynamic name (only works with ES6+)
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

/**
 * Create new selectors for the module. A selector is a function
 * that takes the module state and optionally additional parameters
 * and returns some selected value.
 *
 * The selector must be a pure function. Its result is memoized
 * for the latest state and parameters.
 *
 * @param simpluxModule the module to create selectors for
 * @param selectorDefinitions the selectors to create
 *
 * @returns an object that contains a function for each provided
 * selector
 */
export function createSelectors<
  TState,
  TSelectorDefinitions extends SelectorDefinitions<TState>
>(
  simpluxModule: SimpluxModule<TState>,
  selectorDefinitions: TSelectorDefinitions,
): ResolvedSelectors<TState, TSelectorDefinitions> {
  const { name: moduleName, selectors } = simpluxModule.$simpluxInternals

  for (const selectorName of Object.keys(selectorDefinitions)) {
    if (selectors[selectorName]) {
      throw new Error(
        `selector '${selectorName}' is already defined for module '${moduleName}'`,
      )
    }
  }

  Object.assign(selectors, selectorDefinitions)

  const resolvedSelectors = Object.keys(selectorDefinitions).reduce(
    (acc, selectorName: keyof TSelectorDefinitions) => {
      const getDefinition = () => selectors[selectorName as string]

      const namedSelector = nameFunction(
        selectorName as string,
        (...args: any[]) => {
          return getDefinition()(simpluxModule.getState(), ...args)
        },
      ) as ResolvedSelector<TState, TSelectorDefinitions[typeof selectorName]>

      acc[selectorName] = namedSelector

      acc[selectorName].withState = (state: TState, ...args: any[]) =>
        getDefinition()(state, ...args)

      return acc
    },
    {} as ResolvedSelectors<TState, TSelectorDefinitions>,
  )

  return resolvedSelectors
}

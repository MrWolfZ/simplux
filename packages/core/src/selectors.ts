import type { SimpluxModule, SimpluxModuleMarker } from './module.js'
import type { Immutable } from './types.js'

/**
 * Helper symbol used for identifying simplux selector objects.
 *
 * @public
 */
// should really be a symbol, but as of TypeScript 4.1 there is a bug
// that causes the symbol to not be properly re-exported in type
// definitions when spreading a select object onto an export, which can
// cause issues with composite builds
export const SIMPLUX_SELECTOR = '[SIMPLUX_SELECTOR]'

/**
 * A function to turn into a selector.
 *
 * @public
 */
export type SelectorDefinition<TState, TReturn> = (
  state: Immutable<TState>,
  ...args: any
) => TReturn

/**
 * The functions to turn into selectors.
 *
 * @public
 */
export interface SelectorDefinitions<TState> {
  [name: string]: SelectorDefinition<TState, any>
}

/**
 * Interface for efficiently identifying simplux selector objects at compile time.
 *
 * @public
 */
export interface SimpluxSelectorMarker<TState, TArgs extends any[], TReturn> {
  /**
   * A symbol that allows efficient compile-time and run-time identification
   * of simplux selector objects.
   *
   * This property will have an `undefined` value at runtime.
   *
   * @public
   */
  readonly [SIMPLUX_SELECTOR]: [TState, TArgs, TReturn]
}

/**
 * A simplux selector is a function that projects a module's state to some value.
 *
 * @public
 */
export interface SimpluxSelector<TState, TArgs extends any[], TReturn>
  extends SimpluxSelectorMarker<TState, TArgs, TReturn> {
  // this signature does not have a TSDoc comment on purpose to allow
  // consumers to define their own docs for their selectors (which would
  // be overwritten if this signature had a TSDoc comment)
  (...args: TArgs): TReturn

  /**
   * The ID that identifies this selector uniquely on the owning module.
   *
   * @internal
   */
  readonly selectorId: number

  /**
   * The name of this selector.
   */
  readonly selectorName: string

  /**
   * By default a selector is evaluated with the module's latest state.
   * This function evaluates the selector with the given state instead.
   *
   * @param state - the state to use when evaluating the selector
   * @param args - the arguments for the selector
   *
   * @returns the selected value
   */
  readonly withState: (state: Immutable<TState>, ...args: TArgs) => TReturn

  /**
   * The module this selector belongs to.
   *
   * @internal
   */
  readonly owningModule: SimpluxModule<TState>
}

type Mutable<T> = { -readonly [prop in keyof T]: T[prop] }

/**
 * A simplux selector is a function that projects a module's state to some value.
 * {@link SimpluxSelector}
 *
 * @public
 */
export type ResolvedSelector<
  TState,
  TSelectorDefinition extends SelectorDefinition<
    TState,
    ReturnType<TSelectorDefinition>
  >
> = TSelectorDefinition extends (
  state: Immutable<TState>,
  ...args: infer TArgs
) => infer TReturn
  ? SimpluxSelector<TState, TArgs, TReturn>
  : never

/**
 * A collection of simplux selectors.
 *
 * @public
 */
export type SimpluxSelectors<
  TState,
  TSelectorDefinitions extends SelectorDefinitions<TState>
> = {
  readonly [name in keyof TSelectorDefinitions]: ResolvedSelector<
    TState,
    TSelectorDefinitions[name]
  >
}

/**
 * Create new selectors for the module. A selector is a function
 * that takes the module state and optionally additional parameters
 * and returns some selected value.
 *
 * The selector must be a pure function. Its result is memoized
 * for the latest state and parameters.
 *
 * @param simpluxModule - the module to create selectors for
 * @param selectorDefinitions - the selectors to create
 *
 * @returns an object that contains a function for each provided
 * selector
 *
 * @public
 */
export function createSelectors<
  TState,
  TSelectorDefinitions extends SelectorDefinitions<TState>
>(
  simpluxModule: SimpluxModuleMarker<TState>,
  selectorDefinitions: TSelectorDefinitions,
): SimpluxSelectors<TState, TSelectorDefinitions> {
  const module = simpluxModule as SimpluxModule<TState>
  const internals = module.$simplux

  const resolvedSelectors = Object.keys(selectorDefinitions).reduce(
    (acc, selectorName: keyof TSelectorDefinitions) => {
      const definition = selectorDefinitions[selectorName as string]!
      const memoizedDefinition = memoize(definition)

      const selectorId = (internals.lastSelectorId || 0) + 1
      internals.lastSelectorId = selectorId

      const namedSelector = nameFunction(
        selectorName as string,
        (...args: any[]) => {
          const mock = internals.selectorMocks?.[selectorId]
          if (mock) {
            return mock(...args)
          }

          return memoizedDefinition(internals.getState(), ...args)
        },
      ) as ResolvedSelector<TState, TSelectorDefinitions[typeof selectorName]>

      acc[selectorName] = namedSelector

      const extras = namedSelector as Mutable<typeof namedSelector>

      extras.withState = memoizedDefinition

      extras.selectorId = selectorId
      extras.selectorName = selectorName as string
      extras.owningModule = module
      extras[SIMPLUX_SELECTOR] = '' as any

      return acc
    },
    {} as Mutable<SimpluxSelectors<TState, TSelectorDefinitions>>,
  )

  return resolvedSelectors

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

  function memoize<TFunction extends Function>(fn: TFunction): TFunction {
    let memoizedArgs: any[] | undefined
    let memoizedResult: any

    function memoizedFunction(...args: any[]) {
      const memoizedResultNeedsToBeRefreshed =
        !memoizedArgs ||
        memoizedArgs.length !== args.length ||
        !memoizedArgs.every((a, idx) => a === args[idx])

      if (memoizedResultNeedsToBeRefreshed) {
        memoizedResult = fn(...args)
        memoizedArgs = args
      }

      return memoizedResult
    }

    return (memoizedFunction as unknown) as TFunction
  }
}

/**
 * Checks if an object is a simplux selector.
 *
 * @param object - the object to check
 *
 * @returns true if the object is a simplux selector
 *
 * @internal
 */
export function _isSimpluxSelector<
  TState,
  TArgs extends any[],
  TReturn,
  TOther
>(
  object: SimpluxSelectorMarker<TState, TArgs, TReturn> | TOther,
): object is SimpluxSelector<TState, TArgs, TReturn> {
  return (object as any)?.[SIMPLUX_SELECTOR] === ''
}

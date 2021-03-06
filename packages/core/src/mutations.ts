import type { SimpluxModule, SimpluxModuleMarker } from './module.js'

/**
 * Helper symbol used for identifying simplux mutation objects.
 *
 * @public
 */
// should really be a symbol, but as of TypeScript 4.1 there is a bug
// that causes the symbol to not be properly re-exported in type
// definitions when spreading a mutation object onto an export, which can
// cause issues with composite builds
export const SIMPLUX_MUTATION = '[SIMPLUX_MUTATION]'

/**
 * A function to turn into a mutation.
 *
 * @public
 */
export type MutationDefinition<TState> = (
  state: TState,
  ...args: any
) => TState | void

/**
 * The functions to turn into mutations.
 *
 * @public
 */
export interface MutationDefinitions<TState> {
  [name: string]: MutationDefinition<TState>
}

/**
 * Interface for efficiently identifying simplux mutation objects at compile time.
 *
 * @public
 */
export interface SimpluxMutationMarker<TState, TArgs extends any[]> {
  /**
   * A symbol that allows efficient compile-time and run-time identification
   * of simplux mutation objects.
   *
   * This property will have an `undefined` value at runtime.
   *
   * @public
   */
  readonly [SIMPLUX_MUTATION]: [TState, TArgs]
}

/**
 * A simplux mutation is a function that updates a module's state.
 *
 * @public
 */
export interface SimpluxMutation<TState, TArgs extends any[]>
  extends SimpluxMutationMarker<TState, TArgs> {
  // this signature does not have a TSDoc comment on purpose to allow
  // consumers to define their own docs for their mutations (which would
  // be overwritten if this signature had a TSDoc comment)
  (...args: TArgs): TState

  /**
   * A unique identifier for this type of mutation.
   *
   * @internal
   */
  readonly type: string

  /**
   * The name of this mutation.
   */
  readonly mutationName: string

  /**
   * When a mutation is called directly it updates the module's state.
   * Sometimes (e.g. for testing) it is useful to call the mutation
   * with a given state. In this case no changes are made to the module.
   *
   * @param state - the state to use when executing the mutation
   * @param args - the arguments for the mutation
   *
   * @returns the updated state
   */
  readonly withState: (state: TState, ...args: TArgs) => TState

  /**
   * When a mutation is called directly it updates the module's state by
   * dispatching a redux action to the store. Sometimes it is useful to
   * instead handle the action yourself instead of having simplux dispatch
   * it automatically. This function returns the redux action instead of
   * dispatching it.
   *
   * @param args - the arguments for the mutation
   *
   * @returns a redux action object
   */
  readonly asAction: (...args: TArgs) => { type: string; args: TArgs }

  /**
   * The module this mutation belongs to.
   *
   * @internal
   */
  readonly owningModule: SimpluxModule<TState>
}

type ShallowMutable<T> = { -readonly [prop in keyof T]: T[prop] }

/**
 * A simplux mutation is a function that updates a module's state.
 * {@link SimpluxMutation}
 *
 * @public
 */
export type ResolvedMutation<
  TState,
  TMutation extends MutationDefinition<TState>
> = TMutation extends (state: TState, ...args: infer TArgs) => TState | void
  ? SimpluxMutation<TState, TArgs>
  : never

/**
 * A collection of simplux mutations.
 *
 * @public
 */
export type SimpluxMutations<
  TState,
  TMutations extends MutationDefinitions<TState>
> = {
  readonly [name in keyof TMutations]: ResolvedMutation<
    TState,
    TMutations[name]
  >
}

/**
 * Create new mutations for the module. A mutation is a function
 * that takes the module state and optionally additional parameters
 * and updates the state.
 *
 * @param simpluxModule - the module to create mutations for
 * @param mutationDefinitions - the mutations to create
 *
 * @returns an object that contains a function for each provided
 * mutation which when called will execute the mutation on the module
 *
 * @public
 */
export function createMutations<
  TState,
  TMutations extends MutationDefinitions<TState>
>(
  simpluxModule: SimpluxModuleMarker<TState>,
  mutationDefinitions: TMutations,
): SimpluxMutations<TState, TMutations> {
  const module = simpluxModule as SimpluxModule<TState>

  const { name: moduleName, dispatch, getReducer, mutations } = module.$simplux

  if (process.env.NODE_ENV !== 'production') {
    for (const mutationName of Object.keys(mutationDefinitions)) {
      if (mutations[mutationName]) {
        throw new Error(
          `mutation '${mutationName}' is already defined for module '${moduleName}'`,
        )
      }
    }
  }

  Object.assign(mutations, mutationDefinitions)

  let currentlyDispatchingMutationName: string | undefined

  const resolvedMutations = Object.keys(mutationDefinitions).reduce(
    (acc, mutationName: keyof TMutations) => {
      const type = `@simplux/${moduleName}/mutation/${mutationName}`

      function createAction(...allArgs: any[]) {
        const args = filterEventArgs(allArgs)

        if (process.env.NODE_ENV !== 'production') {
          if (args.some((arg) => typeof arg === 'function')) {
            throw new Error(
              // tslint:disable-next-line: max-line-length
              `mutation '${mutationName}' was called with a function argument; mutation arguments must be serializable, therefore functions are not supported`,
            )
          }
        }

        return { type, mutationName, args }
      }

      const mutation = nameFunction(
        mutationName as string,
        (...args: any[]) => {
          const mock = module.$simplux.mutationMocks?.[mutationName as string]

          if (mock) {
            return mock(...args)
          }

          if (process.env.NODE_ENV !== 'production') {
            if (currentlyDispatchingMutationName) {
              throw new Error(
                // tslint:disable-next-line: max-line-length
                `mutation '${mutationName}' was attempted to be dispatched from within mutation '${currentlyDispatchingMutationName}' which is not allowed; instead use '${mutationName}.withState(...)' to call the mutation without a dispatch`,
              )
            }
          }

          currentlyDispatchingMutationName = mutationName as string
          dispatch(createAction(...args))
          currentlyDispatchingMutationName = undefined
          return module.state()
        },
      ) as ResolvedMutation<TState, TMutations[typeof mutationName]>

      acc[mutationName] = mutation

      const extras = mutation as ShallowMutable<typeof mutation>

      extras.withState = (state: TState, ...args: any[]) => {
        return getReducer()(state, createAction(...args))
      }

      extras.asAction = createAction as any

      extras.type = type

      extras.mutationName = mutationName as string
      extras.owningModule = module
      extras[SIMPLUX_MUTATION] = '' as any

      return acc
    },
    {} as ShallowMutable<SimpluxMutations<TState, TMutations>>,
  )

  return resolvedMutations

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
}

// a very common use case for mutations in frontend applications is to
// use them as event handlers for HTML elements like buttons; if the
// mutation has no arguments and is passed directly as an event handler
// (e.g. in React applications: onClick={myMutation}) it will get the
// HTML event passed as an argument; we believe that in 99.99999% of
// all cases where this happens we do not want that arg; therefore, we
// filter any argument here that looks like an HTML event; if someone
// needs an event as an arg, they can just wrap it in an object or
// tuple as a workaround; we are not mentioning this in the docs, since
// it is such an edge case and we can just tell people about the work-
// around when they create a bug report
function filterEventArgs(args: any[]) {
  if (args.length === 0) {
    return args
  }

  if (isEvent(args[0])) {
    return args.slice(1)
  }

  return args
}

declare class Event {}

function isEvent(arg: any) {
  // tslint:disable-next-line: strict-type-predicates
  if (typeof Event !== 'undefined' && arg instanceof Event) {
    return true
  }

  if (arg === null || arg === undefined) {
    return false
  }

  // check if it looks like an event
  if (
    hasProp(arg, 'target') &&
    hasProp(arg, 'currentTarget') &&
    hasProp(arg, 'defaultPrevented')
  ) {
    return true
  }

  return false

  function hasProp(arg: any, name: string) {
    return Object.prototype.hasOwnProperty.call(arg, name)
  }
}

/**
 * Checks if an object is a simplux mutation.
 *
 * @param object - the object to check
 *
 * @returns true if the object is a simplux mutation
 *
 * @internal
 */
export function _isSimpluxMutation<TState, TArgs extends any[], TOther>(
  object: SimpluxMutationMarker<TState, TArgs> | TOther,
): object is SimpluxMutation<TState, TArgs> {
  return (object as any)?.[SIMPLUX_MUTATION] === ''
}

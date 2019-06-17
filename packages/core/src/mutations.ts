import { Action } from 'redux'
import { SimpluxModule, SimpluxModuleInternals } from './module'

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

/**
 * @private
 */
export interface ResolvedMutationInternals<TState> {
  /**
   * The name of this mutation. This is part of the simplux internal API
   * and should not be accessed except by simplux extensions.
   *
   * @private
   */
  mutationName: string

  /**
   * The module this mutation belongs to. This is part of the simplux
   * internal API and should not be accessed except by simplux extensions.
   *
   * @private
   */
  owningModule: SimpluxModule<TState>
}

export interface ResolvedMutationExtras<TState, TArgs extends any[]> {
  /**
   * A unique identifier for this type of mutation.
   */
  readonly type: string

  /**
   * When a mutation is called directly it updates the module's state.
   * Sometimes (e.g. for testing) it is useful to call the mutation
   * with a given state. In this case no changes are made to the module.
   */
  readonly withState: (state: TState) => (...args: TArgs) => TState

  /**
   * When a mutation is called directly it updates the module's state by
   * dispatching a redux action to the store. Sometimes it is useful to
   * instead handle the action yourself instead of having simplux dispatch
   * it automatically. This function returns the redux action instead of
   * dispatching it.
   */
  readonly asActionCreator: (...args: TArgs) => { type: string; args: TArgs }
}

type MutableResolvedMutationExtras<TState, TArgs extends any[]> = {
  -readonly [prop in keyof ResolvedMutationExtras<
    TState,
    TArgs
  >]: ResolvedMutationExtras<TState, TArgs>[prop]
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
> = {
  readonly [name in keyof TMutations]: ResolvedMutation<
    TState,
    TMutations[name]
  >
}

type MutableResolvedMutations<
  TState,
  TMutations extends MutationsBase<TState>
> = {
  -readonly [name in keyof ResolvedMutations<
    TState,
    TMutations
  >]: ResolvedMutations<TState, TMutations>[name]
}

export type MutationsFactory<TState> = <
  TMutations extends MutationsBase<TState>
>(
  mutations: TMutations,
) => ResolvedMutations<TState, TMutations>

const createMutationPrefix = (moduleName: string) =>
  `@simplux/${moduleName}/mutation/`

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

/**
 * Create new mutations for the module. A mutation is a function
 * that takes the module state and optionally additional parameters
 * and returns an updated version of the state.
 *
 * @param simpluxModule the module to create mutations for
 * @param mutations the mutations to create
 *
 * @returns an object that contains a function for each provided
 * mutation which when called will execute the mutation on the module
 */
export function createMutations<
  TState,
  TMutations extends MutationsBase<TState>
>(
  simpluxModule: SimpluxModule<TState>,
  mutations: TMutations,
): ResolvedMutations<TState, TMutations> {
  const moduleName = simpluxModule.name
  const {
    extensionStateContainer,
    dispatch,
    getReducer,
  } = (simpluxModule as unknown) as SimpluxModuleInternals

  const moduleMutations = extensionStateContainer.mutations as MutationsBase<
    TState
  >

  const mutationPrefix = createMutationPrefix(moduleName)

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
      const type = `${mutationPrefix}${mutationName}`

      const createAction = (...allArgs: any[]) => {
        const args = filterEventArgs(allArgs)
        return { type, mutationName, args }
      }

      const mutation = nameFunction(
        mutationName as string,
        (...args: any[]) => {
          dispatch(createAction(...args))
          return simpluxModule.getState()
        },
      ) as ResolvedMutation<TState, TMutations[typeof mutationName]>

      acc[mutationName] = mutation

      const extras = mutation as MutableResolvedMutationExtras<TState, any>

      extras.withState = (state: TState) => (...args: any[]) => {
        return getReducer()(state, createAction(...args))
      }

      extras.asActionCreator = createAction as any

      extras.type = type

      const internals = (mutation as unknown) as ResolvedMutationInternals<
        TState
      >

      internals.mutationName = mutationName as string
      internals.owningModule = simpluxModule

      return acc
    },
    {} as MutableResolvedMutations<TState, TMutations>,
  )

  return resolvedMutations
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

  // check if it looks like an event
  if (
    hasProp(arg, 'target') &&
    hasProp(arg, 'currentTarget') &&
    hasProp(arg, 'defaultPrevented')
  ) {
    return true
  }

  return !arg
}

function hasProp(arg: any, name: string) {
  return Object.prototype.hasOwnProperty.call(arg, name)
}

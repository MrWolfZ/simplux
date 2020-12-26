import type {
  Immutable,
  MutationDefinitions,
  SelectorDefinitions,
  SimpluxModule,
  SimpluxMutations,
  SimpluxSelectors,
} from '@simplux/core'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

/**
 * The basic methods for a module service.
 *
 * @public
 */
export interface ModuleServiceState<TState> {
  /**
   * Get a snapshot of the module's current state. The snapshot is
   * immutable and will therefore not be changed even if the module
   * is updated.
   *
   * @returns a snapshot of the module's current state
   */
  getCurrentState: () => TState

  /**
   * Get an observable of state changes of the module. The observable
   * emits the module's current state immediately when subscribed to.
   * Afterwards it will emit a new value whenever the module gets
   * updated.
   *
   * @returns an observable of state changes of the module
   */
  selectState: () => Observable<TState>
}

/**
 * Helper type to transform a selector into a function that returns
 * an observable of the selected value.
 *
 * @public
 */
export type ObservableSelector<TSelector> = TSelector extends (
  ...args: infer TArgs
) => infer TReturn
  ? (...args: TArgs) => Observable<TReturn>
  : never

/**
 * A collection of observable module selectors.
 *
 * @public
 */
export type ModuleServiceSelectors<
  TState,
  TSelectors extends SelectorDefinitions<TState>,
  TSimpluxSelectors extends SimpluxSelectors<TState, TSelectors>
> = {
  [selectorName in keyof TSimpluxSelectors]: ObservableSelector<
    TSimpluxSelectors[selectorName]
  >
}

/**
 * A service for interacting with a module.
 *
 * @public
 */
export type ModuleService<
  TState,
  TMutations extends MutationDefinitions<TState>,
  TSimpluxMutations extends SimpluxMutations<TState, TMutations>,
  TSelectors extends SelectorDefinitions<TState>,
  TSimpluxSelectors extends SimpluxSelectors<TState, TSelectors>
> = ModuleServiceState<TState> &
  TSimpluxMutations &
  ModuleServiceSelectors<TState, TSelectors, TSimpluxSelectors>

/**
 * Create a base which contains methods for interacting with a module.
 * This base class should be extended from an Angular service.
 *
 * For each mutation the service has a method to execute the mutation.
 *
 * For each selector the service has a method that returns an observable.
 * The observable immediately emits the result of the selector applied
 * to the module's current state when subscribed to. New values are
 * emitted whenever the state and the selector's result for that state
 * change.
 *
 * @param simpluxModule - the module to create the base class for
 * @param mutations - the mutations to add to the class
 * @param selectors - the selectors to add to the class
 *
 * @returns a base class that should be extended from an Angular service
 *
 * @public
 */
export function createModuleServiceBaseClass<
  TState,
  TMutations extends MutationDefinitions<TState>,
  TSimpluxMutations extends SimpluxMutations<TState, TMutations>,
  TSelectors extends SelectorDefinitions<TState>,
  TSimpluxSelectors extends SimpluxSelectors<TState, TSelectors>
>(
  simpluxModule: SimpluxModule<TState>,
  mutations: TSimpluxMutations,
  selectors: TSimpluxSelectors,
): new () => ModuleService<
  TState,
  TMutations,
  TSimpluxMutations,
  TSelectors,
  TSimpluxSelectors
> {
  return class {
    getCurrentState = simpluxModule.state
    selectState = () => observeState(simpluxModule)

    constructor() {
      Object.assign(this, mutations)
      Object.assign(
        this,
        createObservableSelectors<TState, TSelectors, TSimpluxSelectors>(
          simpluxModule,
          selectors,
        ),
      )
    }
  } as any
}

function createObservableSelectors<
  TState,
  TSelectors extends SelectorDefinitions<TState>,
  TSimpluxSelectors extends SimpluxSelectors<TState, TSelectors>
>(
  simpluxModule: SimpluxModule<TState>,
  selectors: TSimpluxSelectors,
): ModuleServiceSelectors<TState, TSelectors, TSimpluxSelectors> {
  const stateChanges$ = observeState(simpluxModule)

  return Object.keys(selectors).reduce(
    (acc, selectorName: keyof TSelectors) => {
      const selector = selectors[selectorName]
      acc[selectorName] = ((...args: any[]) =>
        stateChanges$.pipe(
          map((state) => selector.withState(state, ...args)),
          distinctUntilChanged(),
        )) as any
      return acc
    },
    {} as ModuleServiceSelectors<TState, TSelectors, TSimpluxSelectors>,
  )
}

function observeState<TState>(simpluxModule: SimpluxModule<TState>) {
  return new Observable<Immutable<TState>>((sub) =>
    simpluxModule.subscribeToStateChanges((state) => sub.next(state)),
  )
}

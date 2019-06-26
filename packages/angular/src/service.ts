import { MutationsBase, ResolvedMutations, SimpluxModule } from '@simplux/core'
import { ResolvedSelectors, SelectorsBase } from '@simplux/selectors'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

/**
 * The basic methods for a module service.
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

export type ObservableSelector<TState, TSelector> = TSelector extends (
  state: TState,
  ...args: infer TArgs
) => infer TReturn
  ? (...args: TArgs) => Observable<TReturn>
  : never

export type ModuleServiceSelectors<
  TState,
  TSelectors extends SelectorsBase<TState>,
  TResolvedSelectors extends ResolvedSelectors<TState, TSelectors>
> = {
  [selectorName in keyof TResolvedSelectors]: ObservableSelector<
    TState,
    TResolvedSelectors[selectorName]
  >
}

export type ModuleService<
  TState,
  TMutations extends MutationsBase<TState>,
  TResolvedMutations extends ResolvedMutations<TState, TMutations>,
  TSelectors extends SelectorsBase<TState>,
  TResolvedSelectors extends ResolvedSelectors<TState, TSelectors>
> = ModuleServiceState<TState> &
  TResolvedMutations &
  ModuleServiceSelectors<TState, TSelectors, TResolvedSelectors>

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
 * @param simpluxModule the module to create the base class for
 * @param mutations the mutations to add to the class
 * @param selectors the selectors to add to the class
 *
 * @returns a base class that should be extended from an Angular service
 */
export function createModuleServiceBaseClass<
  TState,
  TMutations extends MutationsBase<TState>,
  TResolvedMutations extends ResolvedMutations<TState, TMutations>,
  TSelectors extends SelectorsBase<TState>,
  TResolvedSelectors extends ResolvedSelectors<TState, TSelectors>
>(
  simpluxModule: SimpluxModule<TState>,
  mutations: TResolvedMutations,
  selectors: TResolvedSelectors,
): new () => ModuleService<
  TState,
  TMutations,
  TResolvedMutations,
  TSelectors,
  TResolvedSelectors
> {
  return class {
    getCurrentState = simpluxModule.getState
    selectState = () => observeState(simpluxModule)

    constructor() {
      Object.assign(this, mutations)
      Object.assign(
        this,
        createObservableSelectors<TState, TSelectors, TResolvedSelectors>(
          simpluxModule,
          selectors,
        ),
      )
    }
  } as any
}

function createObservableSelectors<
  TState,
  TSelectors extends SelectorsBase<TState>,
  TResolvedSelectors extends ResolvedSelectors<TState, TSelectors>
>(
  simpluxModule: SimpluxModule<TState>,
  selectors: TResolvedSelectors,
): ModuleServiceSelectors<TState, TSelectors, TResolvedSelectors> {
  const stateChanges$ = observeState(simpluxModule)

  return Object.keys(selectors).reduce(
    (acc, selectorName: keyof TSelectors) => {
      const selector = selectors[selectorName]
      acc[selectorName] = ((...args: any[]) =>
        stateChanges$.pipe(
          map(state => selector(state, ...args)),
          distinctUntilChanged(),
        )) as any
      return acc
    },
    {} as ModuleServiceSelectors<TState, TSelectors, TResolvedSelectors>,
  )
}

function observeState<TState>(simpluxModule: SimpluxModule<TState>) {
  return new Observable<TState>(sub =>
    simpluxModule.subscribeToStateChanges(state => sub.next(state)),
  )
}

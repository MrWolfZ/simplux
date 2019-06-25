import { MutationsBase, ResolvedMutations, SimpluxModule } from '@simplux/core'
import { ResolvedSelectors, SelectorsBase } from '@simplux/selectors'
import { Observable } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

export interface ModuleServiceState<TState> {
  getState: () => TState
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
    getState = simpluxModule.getState

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
  const stateChanges$ = new Observable<TState>(sub =>
    simpluxModule.subscribeToStateChanges(state => sub.next(state)),
  )

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

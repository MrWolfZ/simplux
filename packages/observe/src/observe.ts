import { SimpluxModuleExtension } from '@simplux/core'
import { Observable } from 'rxjs'

export interface SimpluxModuleObserveExtensions<TState> {
  /**
   * Observe state changes for this module. The returned observable
   * emits the current module state immediately when subscribed to.
   *
   * @returns an RxJS observable of state changes for this module
   */
  observeState: () => Observable<TState>
}

declare module '@simplux/core' {
  export interface SimpluxModule<TState>
    extends SimpluxModuleObserveExtensions<TState> {}
}

export const observeModuleExtension: SimpluxModuleExtension<
  SimpluxModuleObserveExtensions<any>
> = (_1, _2, { subscribeToStateChanges }) => {
  return {
    observeState: () =>
      new Observable(susbcriber =>
        subscribeToStateChanges(state => {
          susbcriber.next(state)
        }),
      ),
  }
}

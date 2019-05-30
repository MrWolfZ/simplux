import { SimpluxModuleExtension, SubscribeToStateChanges } from '@simplux/core'
import { useModuleSelector } from './useModuleSelector'

export type SimpluxModuleSelectorHook<TState> = <TResult>(
  selector: (state: TState) => TResult,
) => TResult

export function createSelectorHook<TState>(
  getModuleState: () => TState,
  subscribeToModuleStateChanges: SubscribeToStateChanges<TState>,
): SimpluxModuleSelectorHook<TState> {
  return <TResult = TState>(selector: (state: TState) => TResult) => {
    return useModuleSelector<TState, TResult>(
      getModuleState,
      subscribeToModuleStateChanges,
      selector,
    )
  }
}

export interface SimpluxModuleReactExtensions<TState> {
  reactHooks: {
    useSelector: SimpluxModuleSelectorHook<TState>;
  }
}

declare module '@simplux/core' {
  interface SimpluxModule<TState>
    extends SimpluxModuleReactExtensions<TState> {}
}

export const reactHooksModuleExtension: SimpluxModuleExtension<
  SimpluxModuleReactExtensions<any>
> = (_, _2, { getState, subscribeToStateChanges }) => {
  return {
    reactHooks: {
      useSelector: createSelectorHook(getState, subscribeToStateChanges),
    },
  }
}

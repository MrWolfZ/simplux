import { SimpluxModuleExtension } from '@simplux/core'
import { useReduxState } from './useReduxState'

export type SimpluxStateHook<TState> = <TResult = TState>(
  selector?: (state: TState) => TResult,
) => TResult

export function createStateHook<TState>(
  moduleName: string,
): SimpluxStateHook<TState> {
  return <TResult = TState>(selector?: (state: TState) => TResult) => {
    return useReduxState<any, TResult>(state =>
      selector ? selector(state[moduleName]) : state[moduleName],
    )
  }
}

export interface SimpluxModuleReactExtensions<TState> {
  reactHooks: {
    useState: SimpluxStateHook<TState>;
  }
}

declare module '@simplux/core' {
  interface SimpluxModule<TState>
    extends SimpluxModuleReactExtensions<TState> {}
}

export const reactHooksModuleExtension: SimpluxModuleExtension<
  SimpluxModuleReactExtensions<any>
> = ({ name }) => {
  return {
    reactHooks: {
      useState: createStateHook(name),
    },
  }
}

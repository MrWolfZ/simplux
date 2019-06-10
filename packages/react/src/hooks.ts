import {
  SimpluxModuleExtension,
  StateChangeHandler,
  SubscribeToStateChanges,
} from '@simplux/core'
import { unstable_batchedUpdates } from 'react-dom'
import { useModuleSelector } from './useModuleSelector'

export function createBatchedSubscribeFunction<TState>(
  subscribeToModuleStateChanges: SubscribeToStateChanges<TState>,
) {
  const handlers: StateChangeHandler<TState>[] = []

  let unsubscribe: (() => void) | undefined

  const subscribeWithBatching: SubscribeToStateChanges<TState> = handler => {
    handlers.push(handler)

    if (handlers.length === 1) {
      unsubscribe = subscribeToModuleStateChanges(state => {
        unstable_batchedUpdates(() => {
          for (const handler of handlers) {
            handler(state)
          }
        })
      })
    }

    return () => {
      const idx = handlers.indexOf(handler)
      if (idx >= 0) {
        handlers.splice(idx, 1)
      }

      if (handlers.length === 0 && unsubscribe) {
        unsubscribe()
        unsubscribe = undefined
      }
    }
  }

  return subscribeWithBatching
}

export type SimpluxModuleSelectorHook<TState> = <TResult>(
  selector: (state: TState) => TResult,
) => TResult

// this interface only exists to allow other extensions to add
// functionality to the selector hook
// @ts-ignore
export interface SimpluxModuleSelectorHookExtras<TState> {}

export function createSelectorHook<TState>(
  getModuleState: () => TState,
  subscribeToModuleStateChanges: SubscribeToStateChanges<TState>,
): SimpluxModuleSelectorHook<TState> {
  const subscribe = createBatchedSubscribeFunction(
    subscribeToModuleStateChanges,
  )

  return <TResult = TState>(selector: (state: TState) => TResult) => {
    return useModuleSelector<TState, TResult>(
      getModuleState,
      subscribe,
      selector,
    )
  }
}

export interface SimpluxModuleReactExtensions<TState> {
  react: {
    hooks: {
      /**
       * A react hook that allows accessing the module's state inside
       * a component.
       *
       * @param selector a function that selects some derived state from
       * the module's state
       *
       * @returns the selected value
       */
      useSelector: SimpluxModuleSelectorHook<TState> &
        SimpluxModuleSelectorHookExtras<TState>;
    };
  }
}

declare module '@simplux/core' {
  interface SimpluxModule<TState>
    extends SimpluxModuleReactExtensions<TState> {}
}

export const reactModuleExtension: SimpluxModuleExtension<
  SimpluxModuleReactExtensions<any>
> = (_, _2, { getState, subscribeToStateChanges }) => {
  return {
    react: {
      hooks: {
        useSelector: createSelectorHook(getState, subscribeToStateChanges),
      },
    },
  }
}

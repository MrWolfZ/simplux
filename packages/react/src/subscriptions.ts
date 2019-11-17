import {
  ResolvedStateChangeHandler,
  StateChangeHandler,
  StateChangeSubscription,
  SubscribeToStateChanges,
} from '@simplux/core'
import { unstable_batchedUpdates } from 'react-dom'

export function createBatchedSubscribeFunction<TState>(
  subscribeToModuleStateChanges: SubscribeToStateChanges<TState>,
) {
  const handlers: StateChangeHandler<TState>[] = []

  let subscription: StateChangeSubscription<any, any> | undefined

  const subscribeWithBatching: SubscribeToStateChanges<TState> = handler => {
    handlers.push(handler)

    if (handlers.length === 1) {
      subscription = subscribeToModuleStateChanges<StateChangeHandler<TState>>(
        (state, previousState) => {
          unstable_batchedUpdates(() => {
            for (const handler of handlers) {
              handler(state, previousState)
            }
          })
        },
      )
    }

    const unsubscribe = () => {
      const idx = handlers.indexOf(handler)
      if (idx >= 0) {
        handlers.splice(idx, 1)
      }

      if (handlers.length === 0 && subscription) {
        subscription.unsubscribe()
        subscription = undefined
      }
    }

    return {
      unsubscribe,
      handler: (handler as unknown) as ResolvedStateChangeHandler<
        TState,
        typeof handler
      >,
    }
  }

  return subscribeWithBatching
}

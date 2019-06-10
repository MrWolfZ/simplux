import { StateChangeHandler, SubscribeToStateChanges } from '@simplux/core'
import { unstable_batchedUpdates } from 'react-dom'

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

import { SubscribeToStateChanges, Subscription } from '@simplux/core'
import { createBatchedSubscribeFunction } from './subscriptions'

describe('subscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(createBatchedSubscribeFunction.name, () => {
    let handler: (state: number, previousState: number) => void
    let subscription: Subscription<any>
    let subscribeToStateChanges: SubscribeToStateChanges<number>

    beforeEach(() => {
      subscription = {
        unsubscribe: jest.fn(),
        handler: () => void 0,
      }

      subscribeToStateChanges = jest.fn().mockImplementation(h => {
        handler = h
        return subscription
      })
    })

    describe('returned subscibe function', () => {
      it('subscribes once when first susbcriber is added', () => {
        const subscribe = createBatchedSubscribeFunction<number>(
          subscribeToStateChanges,
        )

        expect(subscribeToStateChanges).not.toHaveBeenCalled()
        subscribe(() => void 0)
        expect(subscribeToStateChanges).toHaveBeenCalledTimes(1)
        subscribe(() => void 0)
        expect(subscribeToStateChanges).toHaveBeenCalledTimes(1)
      })

      it('unsubscribes when last susbcriber is removed', () => {
        const subscribe = createBatchedSubscribeFunction<number>(
          subscribeToStateChanges,
        )

        const sub1 = subscribe(() => void 0)
        const sub2 = subscribe(() => void 0)
        expect(subscription.unsubscribe).not.toHaveBeenCalled()
        sub1.unsubscribe()
        expect(subscription.unsubscribe).not.toHaveBeenCalled()
        sub2.unsubscribe()
        expect(subscription.unsubscribe).toHaveBeenCalledTimes(1)
      })

      it('notifies all susbcribers', () => {
        const subscribe = createBatchedSubscribeFunction<number>(
          subscribeToStateChanges,
        )

        const handler1 = jest.fn()
        subscribe(handler1)
        const handler2 = jest.fn()
        subscribe(handler2)

        handler(10, 0)

        expect(handler1).toHaveBeenCalledWith(10, 0)
        expect(handler2).toHaveBeenCalledWith(10, 0)
      })

      it('does not cause side-effect when unsubscribing twice', () => {
        const subscribe = createBatchedSubscribeFunction<number>(
          subscribeToStateChanges,
        )

        const sub1 = subscribe(() => void 0)
        subscribe(() => void 0)
        expect(subscription.unsubscribe).not.toHaveBeenCalled()
        sub1.unsubscribe()
        expect(subscription.unsubscribe).not.toHaveBeenCalled()
        sub1.unsubscribe()
        expect(subscription.unsubscribe).not.toHaveBeenCalled()
      })

      it('returns a subscription with the handler', () => {
        const subscribe = createBatchedSubscribeFunction<number>(
          subscribeToStateChanges,
        )

        const handler = () => void 0
        subscription = subscribe(handler)
        expect(subscription.handler).toBe(handler)
      })
    })
  })
})

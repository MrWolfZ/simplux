import { SubscribeToStateChanges, Unsubscribe } from '@simplux/core'
import { createBatchedSubscribeFunction } from './subscriptions'

describe('subscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe(createBatchedSubscribeFunction.name, () => {
    let handler: (state: number, previousState: number) => void
    let unsubscribe: Unsubscribe
    let subscribeToStateChanges: SubscribeToStateChanges<number>

    beforeEach(() => {
      unsubscribe = jest.fn()

      subscribeToStateChanges = jest.fn().mockImplementation(h => {
        handler = h
        return unsubscribe
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

        const unsub1 = subscribe(() => void 0)
        const unsub2 = subscribe(() => void 0)
        expect(unsubscribe).not.toHaveBeenCalled()
        unsub1()
        expect(unsubscribe).not.toHaveBeenCalled()
        unsub2()
        expect(unsubscribe).toHaveBeenCalledTimes(1)
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

        const unsub1 = subscribe(() => void 0)
        subscribe(() => void 0)
        expect(unsubscribe).not.toHaveBeenCalled()
        unsub1()
        expect(unsubscribe).not.toHaveBeenCalled()
        unsub1()
        expect(unsubscribe).not.toHaveBeenCalled()
      })
    })
  })
})

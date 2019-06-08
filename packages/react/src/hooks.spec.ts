import {
  SimpluxModuleCore,
  SimpluxStore,
  SubscribeToStateChanges,
  Unsubscribe,
} from '@simplux/core'
import { renderHook } from 'react-hooks-testing-library'
import { createBatchedSubscribeFunction, reactModuleExtension } from './hooks'

describe('selectors', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  const getStoreStateMock = jest.fn()
  const setReducerMock = jest.fn()
  const getReducerMock = jest.fn()

  let moduleState = {}
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  const storeMock: SimpluxStore = {
    rootReducer: s => s,
    getState: getStoreStateMock,
    dispatch: dispatchMock,
    subscribe: jest.fn(),
    setReducer: setReducerMock,
    getReducer: getReducerMock,
    featureFlags: {
      freezeStateDuringMutations: () => false,
    },
  }

  const moduleMock: SimpluxModuleCore<any> = {
    getState: getModuleStateMock,
    setState: setModuleStateMock,
    subscribeToStateChanges: subscribeToModuleStateChangesMock,
  }

  beforeEach(() => {
    moduleState = {}
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('returns an object with the hooks', () => {
      const value = reactModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        {},
      )

      expect(value.react).toBeDefined()
      expect(value.react.hooks).toBeDefined()
      expect(value.react.hooks.useSelector).toBeDefined()
    })
  })

  describe('selector hook', () => {
    it('works', () => {
      moduleState = 10

      const value = reactModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        {},
      )

      const { result } = renderHook(() => value.react.hooks.useSelector(c => c))

      expect(result.current).toBe(10)
    })
  })

  describe(createBatchedSubscribeFunction.name, () => {
    let handler: (state: number) => void
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

        handler(10)

        expect(handler1).toHaveBeenCalledWith(10)
        expect(handler2).toHaveBeenCalledWith(10)
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

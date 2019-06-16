import { SimpluxModuleCore, SimpluxStore } from '@simplux/core'
import { Observable, Subscription } from 'rxjs'
import { observeModuleExtension } from './observe'

describe('observe', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  const getStoreStateMock = jest.fn()
  const setReducerMock = jest.fn()
  const getReducerMock = jest.fn()

  let moduleState = { prop: 'value' }
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const unsubscribeMock = jest.fn()
  let subscriber: (state: typeof moduleState) => void
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(sub => {
      subscriber = sub
      sub(moduleState)
      return unsubscribeMock
    })

  const storeMock: SimpluxStore = {
    rootReducer: s => s,
    getState: getStoreStateMock,
    dispatch: dispatchMock,
    subscribe: jest.fn(),
    setReducer: setReducerMock,
    getReducer: getReducerMock,
  }

  const moduleMock: SimpluxModuleCore<any> = {
    getState: getModuleStateMock,
    setState: setModuleStateMock,
    subscribeToStateChanges: subscribeToModuleStateChangesMock,
  }

  beforeEach(() => {
    moduleState = { prop: 'value' }
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('returns an object with the observe function', () => {
      const value = observeModuleExtension<number>(
        {
          name: 'test',
          initialState: 10,
        },
        storeMock,
        moduleMock,
        {},
      )

      expect(value.observeState).toBeDefined()
    })
  })

  describe(`observe function`, () => {
    let observeState: () => Observable<number>

    let subscription: Subscription

    beforeEach(() => {
      subscription = new Subscription()

      const ext = observeModuleExtension<typeof moduleState>(
        {
          name: 'test',
          initialState: moduleState,
        },
        storeMock,
        moduleMock,
        {},
      )

      observeState = ext.observeState
    })

    afterEach(() => {
      subscription.unsubscribe()
    })

    it('returns a cold observable', () => {
      observeState()

      expect(subscribeToModuleStateChangesMock).not.toHaveBeenCalled()
    })

    describe(`returned observable`, () => {
      it('susbcribes to state changes on subscribe', () => {
        subscription.add(observeState().subscribe())

        expect(subscribeToModuleStateChangesMock).toHaveBeenCalled()
      })

      it('unsusbcribes to state changes on unsubscribe', () => {
        observeState()
          .subscribe()
          .unsubscribe()

        expect(unsubscribeMock).toHaveBeenCalled()
      })

      it('emits the current module state value on subscribe', () => {
        const sub = jest.fn()
        subscription.add(observeState().subscribe(sub))

        expect(sub).toHaveBeenCalledWith(moduleState)
      })

      it('emits the current module state value when it changes', () => {
        const updatedState: typeof moduleState = {
          prop: 'updated',
        }

        const sub = jest.fn()
        subscription.add(observeState().subscribe(sub))

        subscriber(updatedState)

        expect(sub).toHaveBeenCalledWith(updatedState)
      })
    })
  })
})

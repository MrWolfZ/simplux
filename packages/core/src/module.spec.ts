import { combineReducers, createStore, Store } from 'redux'
import {
  createModule,
  SimpluxModule,
  SimpluxModuleInternals,
  Subscription,
} from './module'
import {
  createReduxStoreProxy,
  createSimpluxStore,
  SimpluxStore,
} from './store'

describe('module', () => {
  describe('creating module', () => {
    let setReducerSpy: jest.SpyInstance
    let simpluxStore: SimpluxStore
    let reduxStore: Store

    beforeEach(() => {
      const getReduxStoreProxy = () =>
        createReduxStoreProxy(reduxStore, s => s, 1, [])
      simpluxStore = createSimpluxStore(getReduxStoreProxy)
      reduxStore = createStore(simpluxStore.rootReducer)
      setReducerSpy = jest.spyOn(simpluxStore, 'setReducer')
    })

    it('sets the reducer', () => {
      const initialState = { prop: 'value' }
      createModule(simpluxStore, {
        name: 'test',
        initialState,
      })

      expect(setReducerSpy).toHaveBeenCalledWith('test', expect.any(Function))
    })

    it('creates the mutation extension state container', () => {
      const initialState = { prop: 'value' }
      const m = (createModule(simpluxStore, {
        name: 'test',
        initialState,
      }) as any) as SimpluxModuleInternals

      expect(m.extensionStateContainer.mutations).toBeDefined()
    })

    it('immediately adds the module state to the overall state', () => {
      const initialState = { prop: 'value' }
      const { getState } = createModule(simpluxStore, {
        name: 'test',
        initialState,
      })

      expect(getState()).toBe(initialState)
      expect(reduxStore.getState().test).toBe(initialState)
    })

    it('immediately adds the module state to the redux state if reducer is nested', () => {
      reduxStore = createStore(
        combineReducers({
          simplux: simpluxStore.rootReducer,
        }),
      )

      const initialState = { prop: 'value' }
      createModule(simpluxStore, {
        name: 'test',
        initialState,
      })

      expect(reduxStore.getState().simplux.test).toBe(initialState)
    })

    it('overrides modules with the same name', () => {
      const initialState = { prop: 'value' }

      createModule(simpluxStore, {
        name: 'test',
        initialState,
      })

      expect(() => {
        createModule(simpluxStore, {
          name: 'test',
          initialState,
        })
      }).not.toThrow()

      expect(setReducerSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('created module', () => {
    let subscribeSpy: jest.SpyInstance
    let simpluxStore: SimpluxStore

    beforeEach(() => {
      const getReduxStoreProxy = () =>
        createReduxStoreProxy(reduxStore, s => s, 1, [])
      simpluxStore = createSimpluxStore(getReduxStoreProxy)
      const reduxStore = createStore(simpluxStore.rootReducer)
      subscribeSpy = jest.spyOn(reduxStore, 'subscribe')
    })

    it('has a name', () => {
      const initialState = { prop: 'value' }
      const { name } = createModule(simpluxStore, {
        name: 'test',
        initialState,
      })

      expect(name).toBe('test')
    })

    describe(`getState`, () => {
      it('returns initial state', () => {
        const initialState = { prop: 'value' }
        const testModule = createModule(simpluxStore, {
          name: 'getStateTest',
          initialState,
        })

        expect(testModule.getState()).toBe(initialState)
      })

      it('returns mocked state if set', () => {
        const initialState = { prop: 'value' }
        const testModule = createModule(simpluxStore, {
          name: 'getStateTest',
          initialState,
        })

        const internals = (testModule as unknown) as SimpluxModuleInternals

        const mockStateValue: typeof initialState = { prop: 'mocked' }
        internals.extensionStateContainer.mockStateValue = mockStateValue

        expect(testModule.getState()).toBe(mockStateValue)
      })
    })

    describe(`setState`, () => {
      it('replaces the whole state', () => {
        const replacedState = { prop: 'updated' }
        const { getState, setState } = createModule(simpluxStore, {
          name: 'setStateTest',
          initialState: { prop: 'value' },
        })

        setState(replacedState)
        expect(getState()).toBe(replacedState)
      })
    })

    describe(`subscribeToStateChanges`, () => {
      let subscription: Subscription<any>
      let handlerSpy: jest.Mock
      const initialState = {
        prop: 'value',
      }
      type Module = SimpluxModule<typeof initialState>
      let setState: Module['setState']
      let subscribeToStateChanges: Module['subscribeToStateChanges']

      beforeEach(() => {
        const module = createModule(simpluxStore, {
          name: 'subscribeToStateChangesTest',
          initialState,
        })

        setState = module.setState
        subscribeToStateChanges = module.subscribeToStateChanges
      })

      beforeEach(() => {
        setState(initialState)
        handlerSpy = jest.fn()
        subscription = subscribeToStateChanges(handlerSpy)
      })

      afterEach(() => {
        subscription.unsubscribe()
      })

      it('calls handler immediately with state', () => {
        expect(handlerSpy).toHaveBeenCalledWith(initialState, initialState)
      })

      it('calls handler immediately with mock state if set', () => {
        const testModule = createModule(simpluxStore, {
          name: 'subscribeToStateChangesTest',
          initialState,
        })

        const internals = (testModule as unknown) as SimpluxModuleInternals

        const mockStateValue: typeof initialState = { prop: 'mocked' }
        internals.extensionStateContainer.mockStateValue = mockStateValue

        const { unsubscribe } = testModule.subscribeToStateChanges(handlerSpy)

        expect(handlerSpy).toHaveBeenCalledWith(mockStateValue, mockStateValue)

        unsubscribe()
      })

      it('calls handler whenever the module state changes', () => {
        const replacedState = {
          prop: 'updated',
        }

        setState(replacedState)

        expect(handlerSpy).toHaveBeenCalledWith(replacedState, initialState)
      })

      it('does not call the handler if the state did not change', () => {
        const replacedState = {
          prop: 'updated',
        }

        handlerSpy.mockClear()

        setState(replacedState)
        setState(replacedState)

        expect(handlerSpy).toHaveBeenCalledTimes(1)
      })

      it('does not call the handler if the mock state is set', () => {
        const testModule = createModule(simpluxStore, {
          name: 'subscribeToStateChangesTest',
          initialState,
        })

        const { unsubscribe } = testModule.subscribeToStateChanges(handlerSpy)

        handlerSpy.mockClear()

        const internals = (testModule as unknown) as SimpluxModuleInternals

        const mockStateValue: typeof initialState = { prop: 'mocked' }
        internals.extensionStateContainer.mockStateValue = mockStateValue

        expect(handlerSpy).not.toHaveBeenCalled()

        unsubscribe()
      })

      it('subscribes to the store only once even if multiple handlers are subscribed', () => {
        subscribeToStateChanges(handlerSpy)

        expect(subscribeSpy).toHaveBeenCalledTimes(1)
      })

      it('unsubscribes the handler when returned callback is called', () => {
        handlerSpy.mockClear()

        setState({ prop: 'updated' })
        subscription.unsubscribe()
        setState({ prop: 'updated' })

        expect(handlerSpy).toHaveBeenCalledTimes(1)
      })

      it('calls handler with latest state if subscribing after state has changed', () => {
        subscription.unsubscribe()
        handlerSpy.mockClear()

        const replacedState = {
          prop: 'updated',
        }

        setState(replacedState)
        subscription = subscribeToStateChanges(handlerSpy)

        expect(handlerSpy).toHaveBeenCalledWith(replacedState, replacedState)
      })

      it('calls handler with updated state if subscribing after state has changed', () => {
        subscription.unsubscribe()
        handlerSpy.mockClear()

        const replacedState = {
          prop: 'updated',
        }

        setState(replacedState)
        subscription = subscribeToStateChanges(handlerSpy)
        handlerSpy.mockClear()

        setState(initialState)

        expect(handlerSpy).toHaveBeenCalledWith(initialState, replacedState)
      })

      it('returns a subscription with the handler', () => {
        expect(subscription.handler).toBe(handlerSpy)
      })

      it('returns a subscription with the handler of the correct type', () => {
        const mock = jest.fn()
        const subscription = subscribeToStateChanges(state => {
          state
          mock()
        })

        subscription.handler(initialState)
        expect(mock).toHaveBeenCalled()
      })
    })
  })
})

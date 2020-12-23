import { setAutoFreeze } from 'immer'
import { combineReducers, createStore, Store } from 'redux'
import {
  createModule,
  SimpluxModule,
  StateChangeSubscription,
  _isSimpluxModule,
} from './module.js'
import {
  _createReduxStoreProxy,
  _createSimpluxStore,
  _SimpluxStore,
} from './store.js'

describe('module', () => {
  describe('creating module', () => {
    let nodeEnv: string | undefined
    let setReducerSpy: jest.SpyInstance
    let simpluxStore: _SimpluxStore
    let reduxStore: Store

    beforeEach(() => {
      const getReduxStoreProxy = () =>
        _createReduxStoreProxy(reduxStore, (s) => s, 1, [])
      simpluxStore = _createSimpluxStore(getReduxStoreProxy)
      reduxStore = createStore(simpluxStore.rootReducer)
      setReducerSpy = jest.spyOn(simpluxStore, 'setReducer')
      nodeEnv = process.env.NODE_ENV
    })

    afterEach(() => {
      process.env.NODE_ENV = nodeEnv
    })

    it('sets the reducer', () => {
      const initialState = { prop: 'value' }
      createModule(simpluxStore, {
        name: 'test',
        initialState,
      })

      expect(setReducerSpy).toHaveBeenCalledWith('test', expect.any(Function))
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

    it('throws for empty name', () => {
      expect(() => {
        createModule(simpluxStore, {
          name: '',
          initialState: 0,
        })
      }).toThrow()
    })

    it('does not throw for empty name in production', () => {
      process.env.NODE_ENV = 'production'

      expect(() => {
        createModule(simpluxStore, {
          name: '',
          initialState: 0,
        })
      }).not.toThrow()
    })
  })

  describe('created module', () => {
    let subscribeSpy: jest.SpyInstance
    let simpluxStore: _SimpluxStore

    beforeEach(() => {
      const getReduxStoreProxy = () =>
        _createReduxStoreProxy(reduxStore, (s) => s, 1, [])
      simpluxStore = _createSimpluxStore(getReduxStoreProxy)
      const reduxStore = createStore(simpluxStore.rootReducer)
      subscribeSpy = jest.spyOn(reduxStore, 'subscribe')
    })

    afterEach(() => {
      setAutoFreeze(true)
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

        const mockStateValue: typeof initialState = { prop: 'mocked' }
        testModule.$simpluxInternals.mockStateValue = mockStateValue

        expect(testModule.getState()).toBe(mockStateValue)
      })

      it('returns frozen state during development', () => {
        const initialState = { prop: 'value' }
        const testModule = createModule(simpluxStore, {
          name: 'getStateTest',
          initialState,
        })

        expect(
          () => ((testModule.getState() as any).prop = 'updated'),
        ).toThrowError()
      })

      it('returns unfrozen state during production', () => {
        // immer freezes objects by default in non-production environments
        // and this default is determined when the module is imported, so
        // instead of setting process.env.NODE_ENV we use the configuration
        // function from immer
        setAutoFreeze(false)

        const initialState = { prop: 'value' }
        const testModule = createModule(simpluxStore, {
          name: 'getStateTest',
          initialState,
        })

        expect(
          () => ((testModule.getState() as any).prop = 'updated'),
        ).not.toThrowError()
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
      let subscription: StateChangeSubscription<any, any>
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

      it('does not call handler with state if configured to skip initial invocation', () => {
        handlerSpy = jest.fn()
        subscription = subscribeToStateChanges(handlerSpy, {
          shouldSkipInitialInvocation: true,
        })

        expect(handlerSpy).not.toHaveBeenCalled()
      })

      it('calls handler immediately with mock state if set', () => {
        const testModule = createModule(simpluxStore, {
          name: 'subscribeToStateChangesTest',
          initialState,
        })

        const mockStateValue: typeof initialState = { prop: 'mocked' }
        testModule.$simpluxInternals.mockStateValue = mockStateValue

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

        const mockStateValue: typeof initialState = { prop: 'mocked' }
        testModule.$simpluxInternals.mockStateValue = mockStateValue

        expect(handlerSpy).not.toHaveBeenCalled()

        unsubscribe()
      })

      it('subscribes to the store only once even if multiple handlers are subscribed', () => {
        subscribeToStateChanges(handlerSpy)

        expect(subscribeSpy).toHaveBeenCalledTimes(1)
      })

      it('unsubscribes the handler when returned unsubscribe callback is called', () => {
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
        const { handler } = subscribeToStateChanges((state) => {
          expect(state.prop).toBe('value')
          mock()
        })

        handler(initialState)
        expect(mock).toHaveBeenCalled()
      })
    })
  })

  describe(_isSimpluxModule.name, () => {
    let simpluxStore: _SimpluxStore

    beforeEach(() => {
      const getReduxStoreProxy = () =>
        _createReduxStoreProxy(reduxStore, (s) => s, 1, [])
      simpluxStore = _createSimpluxStore(getReduxStoreProxy)
      const reduxStore = createStore(simpluxStore.rootReducer)
    })

    it('returns true for a simplux module', () => {
      const isSimpluxModuleTestModule = createModule(simpluxStore, {
        name: 'isSimpluxModuleTest',
        initialState: '',
      })

      expect(_isSimpluxModule(isSimpluxModuleTestModule)).toBe(true)
    })

    it('returns false for a string value', () => {
      expect(_isSimpluxModule('string')).toBe(false)
    })

    it('returns false for a number value', () => {
      expect(_isSimpluxModule(10)).toBe(false)
    })

    it('returns false for an object value', () => {
      expect(_isSimpluxModule({})).toBe(false)
    })
  })
})

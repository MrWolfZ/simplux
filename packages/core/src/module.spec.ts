import { combineReducers, createStore, Store } from 'redux'
import {
  createModule,
  moduleExtensions,
  registerModuleExtension,
  SimpluxModule,
  Unsubscribe,
} from './module'
import {
  createReduxStoreProxy,
  createSimpluxStore,
  getDefaultFeatureFlags,
  SimpluxStore,
} from './store'

describe('module', () => {
  describe('registering extension', () => {
    it('stores the extension', () => {
      const unregister = registerModuleExtension(() => ({}))
      expect(moduleExtensions.length).toBe(1)
      unregister()
    })

    it('returns unregister function', () => {
      const unregister = registerModuleExtension(() => ({}))
      unregister()
      expect(moduleExtensions.length).toBe(0)
    })

    it('does not throw when unregistering multiple times', () => {
      const unregister = registerModuleExtension(() => ({}))
      expect(() => {
        unregister()
        unregister()
      }).not.toThrow()
    })
  })

  describe('creating module', () => {
    let setReducerSpy: jest.SpyInstance
    let simpluxStore: SimpluxStore
    let reduxStore: Store

    beforeEach(() => {
      const getReduxStoreProxy = () =>
        createReduxStoreProxy(reduxStore, s => s, 1, [])
      simpluxStore = createSimpluxStore(
        getReduxStoreProxy,
        getDefaultFeatureFlags(),
      )
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
      simpluxStore = createSimpluxStore(
        getReduxStoreProxy,
        getDefaultFeatureFlags(),
      )
      const reduxStore = createStore(simpluxStore.rootReducer)
      subscribeSpy = jest.spyOn(reduxStore, 'subscribe')
    })

    describe(`getState`, () => {
      it('returns initial state', () => {
        const initialState = { prop: 'value' }
        const { getState } = createModule(simpluxStore, {
          name: 'test',
          initialState,
        })

        expect(getState()).toBe(initialState)
      })
    })

    describe(`setState`, () => {
      it('replaces the whole state', () => {
        const replacedState = { prop: 'updated' }
        const { getState, setState } = createModule(simpluxStore, {
          name: 'test',
          initialState: { prop: 'value' },
        })

        setState(replacedState)
        expect(getState()).toBe(replacedState)
      })
    })

    describe(`subscribeToStateChanges`, () => {
      let unsubscribe: Unsubscribe
      let handlerSpy: jest.Mock
      const initialState = {
        prop: 'value',
      }
      type Module = SimpluxModule<typeof initialState>
      let setState: Module['setState']
      let subscribeToStateChanges: Module['subscribeToStateChanges']

      beforeEach(() => {
        const module = createModule(simpluxStore, {
          name: 'test',
          initialState,
        })

        setState = module.setState
        subscribeToStateChanges = module.subscribeToStateChanges
      })

      beforeEach(() => {
        setState(initialState)
        handlerSpy = jest.fn()
        unsubscribe = subscribeToStateChanges(handlerSpy)
      })

      afterEach(() => {
        unsubscribe()
      })

      it('calls handler whenever the module state changes', () => {
        const replacedState = {
          prop: 'updated',
        }

        setState(replacedState)

        expect(handlerSpy).toHaveBeenCalledWith(replacedState)
      })

      it('does not call the handler if the state did not change', () => {
        const replacedState = {
          prop: 'updated',
        }

        setState(replacedState)
        setState(replacedState)

        expect(handlerSpy).toHaveBeenCalledTimes(1)
      })

      it('subscribes to the store only once even if multiple handlers are subscribed', () => {
        subscribeToStateChanges(handlerSpy)

        expect(subscribeSpy).toHaveBeenCalledTimes(1)
      })

      it('unsubscribes the handler when returned callback is called', () => {
        setState({ prop: 'updated' })
        unsubscribe()
        setState({ prop: 'updated' })

        expect(handlerSpy).toHaveBeenCalledTimes(1)
      })
    })
  })
})

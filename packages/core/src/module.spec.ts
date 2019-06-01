import { createStore } from 'redux'
import {
  createModule,
  moduleExtensions,
  registerModuleExtension,
  SimpluxModule,
  Unsubscribe,
} from './module'
import { setReduxStore, simpluxStore } from './store'

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

describe('created module', () => {
  let subscribeSpy: jest.SpyInstance
  let undo: () => void

  beforeEach(() => {
    const reduxStore = createStore(simpluxStore.rootReducer)
    undo = setReduxStore(reduxStore, s => s)
    subscribeSpy = jest.spyOn(reduxStore, 'subscribe')
  })

  afterEach(() => {
    undo()
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

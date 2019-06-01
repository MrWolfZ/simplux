import { createStore } from 'redux'
import { createSimpluxStore, setReduxStore, simpluxStore } from './store'

describe('store', () => {
  let cleanup: (() => void) | undefined

  afterEach(() => {
    if (cleanup) {
      cleanup()
      cleanup = undefined
    }
  })

  describe(setReduxStore.name, () => {
    it(`sets the store`, () => {
      cleanup = setReduxStore(createStore((c: number = 10) => c + 1), s => s)
      expect(simpluxStore.getState()).toBe(11)
    })

    it(`does not throw if store is cleaned up multiple times`, () => {
      const cleanup1 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      expect(() => {
        cleanup1()
        cleanup1()
      }).not.toThrow()
    })

    it(`throws if trying to clean up outdated store`, () => {
      const cleanup1 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      const cleanup2 = setReduxStore(
        createStore((c: number = 10) => c + 1),
        s => s,
      )

      expect(cleanup1).toThrowError('cannot cleanup store')
      cleanup2()
    })
  })

  it(`exports a root reducer`, () => {
    const { rootReducer } = createSimpluxStore(() => undefined!)
    const state = {}
    expect(rootReducer(state, { type: '' })).toBe(state)
  })

  it(`allows setting and getting a reducer`, () => {
    const { setReducer, getReducer } = createSimpluxStore(() => undefined!)
    const reducer = (s = {}) => s
    setReducer('test', reducer)
    expect(getReducer('test')).toBe(reducer)
  })

  it(`allows dispatching actions`, () => {
    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )
    expect(simpluxStore.getState()).toBe(10)
    simpluxStore.dispatch({ type: 'INC' })
    expect(simpluxStore.getState()).toBe(11)
  })

  it(`allows subscribing to store state changes`, () => {
    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)
    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalled()
    unsubscribe()
  })

  it(`unsubscribes from store state changes`, () => {
    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)
    simpluxStore.dispatch({ type: 'INC' })
    unsubscribe()
    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it(`does not throw when unsubscribing twice from store subscription`, () => {
    cleanup = setReduxStore(createStore((c: number = 10) => c), s => s)

    const unsubscribe = simpluxStore.subscribe(jest.fn())

    expect(() => {
      unsubscribe()
      unsubscribe()
    }).not.toThrow()
  })

  it(`persists subscriptions through store changes`, () => {
    setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)

    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)

    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(2)

    unsubscribe()
  })

  it(`cleans up subscriptions on old store on store change`, () => {
    const store1 = createStore((c: number = 10, { type }) =>
      type === 'INC' ? c + 1 : c,
    )

    setReduxStore(store1, s => s)

    const handler = jest.fn()
    const unsubscribe = simpluxStore.subscribe(handler)

    simpluxStore.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)

    cleanup = setReduxStore(
      createStore((c: number = 10, { type }) => (type === 'INC' ? c + 1 : c)),
      s => s,
    )

    store1.dispatch({ type: 'INC' })
    expect(handler).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it(`throws if store is not set when accessing state`, () => {
    expect(() => simpluxStore.getState()).toThrowError(
      'simplux must be initialized with a redux store',
    )
  })
})

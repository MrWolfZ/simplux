import { getSimpluxReducer, setReduxStoreForSimplux } from '@simplux/core'
import { createStore } from 'redux'
import { increment, incrementBy, setCounterState } from './counter.module'

describe('counter module', () => {
  beforeEach(() => {
    // it is possible to test mutations without touching the module
    // at all (see the first test case below for an example); however,
    // when testing the mutation with the module we need to make sure
    // we have simplux configured with a redux store and that we reset
    // the module state before each test
    setReduxStoreForSimplux(createStore(getSimpluxReducer()), s => s)
    setCounterState({ counter: 0 })
  })

  describe('mutations', () => {
    describe('increment', () => {
      it('increments the counter by one', () => {
        // to test our mutation easily with any state we can use
        // `withState` to provide a custom value
        const result1 = increment.withState({ counter: 10 })()
        expect(result1.counter).toBe(11)

        // if you prefer, you can also test the mutation with the module
        setCounterState({ counter: 20 })
        const result2 = increment()
        expect(result2.counter).toBe(21)
      })
    })

    describe('incrementBy', () => {
      it('increments the counter by the provided amount', () => {
        // we can also easily provide additional arguments to the
        // mutation
        const result1 = incrementBy.withState({ counter: 10 })(5)
        expect(result1.counter).toBe(15)

        // and of course we can also test the mutation with the module
        setCounterState({ counter: 20 })
        const result2 = incrementBy(5)
        expect(result2.counter).toBe(25)
      })
    })
  })
})

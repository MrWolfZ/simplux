// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import { counter, CounterState } from './counter.module'

describe('counter module', () => {
  // by default our mutations will update their module's state when
  // called; however, it is best to test our mutations in isolation
  // with a specific state value
  const testState: CounterState = { value: 10 }

  describe('mutations', () => {
    describe('increment', () => {
      it('increments the counter by one', () => {
        // mutations are tested in isolation by providing a custom
        // state value with `withState`; when called this way the
        // mutation does not affect the module's state at all
        const result = counter.increment.withState(testState)
        expect(result.value).toBe(11)
      })
    })

    describe('incrementBy', () => {
      it('increments the counter by the provided amount', () => {
        // of course you can also provide arguments to your mutations
        const result = counter.incrementBy.withState(testState, 5)
        expect(result.value).toBe(15)
      })
    })
  })
})

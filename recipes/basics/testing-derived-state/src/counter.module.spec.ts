// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import { counter, CounterState } from './counter.module'

describe('counter module', () => {
  const testState: CounterState = { value: 10 }

  describe('selectors', () => {
    describe('plusOne', () => {
      it('returns the counter plus one', () => {
        // to test your selector call it with a specific state
        const result = counter.plusOne.withState(testState)
        expect(result).toBe(11)
      })
    })

    describe('plus', () => {
      it('returns the sum of the counter and the amount', () => {
        // of course you can also provide arguments to your selectors
        const result = counter.plus.withState(testState, 5)
        expect(result).toBe(15)
      })
    })
  })
})

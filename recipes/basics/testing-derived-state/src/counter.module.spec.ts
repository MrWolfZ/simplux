// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import { CounterState, plus, plusOne } from './counter.module'

describe('counter module', () => {
  const testState: CounterState = { counter: 10 }

  describe('selectors', () => {
    describe('plusOne', () => {
      it('returns the counter plus one', () => {
        // to test your selector just call it directly
        const result = plusOne(testState)
        expect(result).toBe(11)
      })
    })

    describe('plus', () => {
      it('returns the sum of the counter and the amount', () => {
        // of course you can also provide arguments to your selectors
        const result = plus(testState, 5)
        expect(result).toBe(15)
      })
    })
  })
})

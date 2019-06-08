// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

import '@simplux/selectors'
import { plus, plusOne, setCounterState } from './counter.module'

describe('counter module', () => {
  describe('selectors', () => {
    describe('plusOne', () => {
      it('returns the counter plus one', () => {
        // to test your selector just call it directly
        const result1 = plusOne({ counter: 10 })
        expect(result1).toBe(11)

        // if you prefer, you can also test the selector by setting
        // the module state and executing the selector bound to the
        // module's state
        setCounterState({ counter: 20 })
        const result2 = plusOne.withLatestModuleState()
        expect(result2).toBe(21)
      })
    })

    describe('plus', () => {
      it('returns the sum of the counter and the amount', () => {
        // of course you can also provide arguments to your selectors;
        // either by calling it directly with state and arguments
        const result1 = plus({ counter: 10 }, 5)
        expect(result1).toBe(15)

        // or by setting the module state and calling the selector bound
        // to the module's state
        setCounterState({ counter: 20 })
        const result2 = plus.withLatestModuleState(5)
        expect(result2).toBe(25)
      })
    })
  })
})

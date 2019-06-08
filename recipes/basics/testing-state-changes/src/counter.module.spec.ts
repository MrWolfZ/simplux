import { increment, incrementBy, setCounterState } from './counter.module'

describe('counter module', () => {
  describe('mutations', () => {
    describe('increment', () => {
      it('increments the counter by one', () => {
        // to test your mutation easily with any state you can use
        // `withState` to provide a custom module state
        const result1 = increment.withState({ counter: 10 })()
        expect(result1.counter).toBe(11)

        // if you prefer, you can also test the mutation by setting
        // the module state and executing the mutation as usual
        setCounterState({ counter: 20 })
        const result2 = increment()
        expect(result2.counter).toBe(21)
      })
    })

    describe('incrementBy', () => {
      it('increments the counter by the provided amount', () => {
        // of course you can also provide arguments to your mutations;
        // either by providing a custom module state directly
        const result1 = incrementBy.withState({ counter: 10 })(5)
        expect(result1.counter).toBe(15)

        // or by setting the module state and calling the mutation
        setCounterState({ counter: 20 })
        const result2 = incrementBy(5)
        expect(result2.counter).toBe(25)
      })
    })
  })
})

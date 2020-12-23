import type { Reducer } from 'redux'
import { createImmerReducer } from './immer.js'

describe(createImmerReducer.name, () => {
  describe(`created reducer`, () => {
    interface T {
      test: string
    }
    const initialState: T = Object.freeze({ test: 'test' })
    const reducer: Reducer<T> = createImmerReducer<T>(
      (state = initialState, { type, value }) => {
        if (type === 'update') {
          state.test = value || 'updated'
        }

        if (type === 'throw') {
          throw new Error()
        }

        if (type === 'nested') {
          const stateCopy = { ...state }
          reducer(stateCopy, { type: 'update', value: 'nested-updated' })
          return stateCopy
        }

        return state
      },
    )

    it('returns the initial state', () => {
      expect(reducer(undefined, { type: '' })).toBe(initialState)
    })

    it('does not mutate the state directly', () => {
      const result = reducer(initialState, { type: 'update' })
      expect(result.test).toBe('updated')
      expect(initialState.test).toBe('test')
    })

    it('does not mutate the state directly on the first action', () => {
      const result = reducer(undefined, { type: 'update' })
      expect(result.test).toBe('updated')
      expect(initialState.test).toBe('test')
    })

    // this test simulates the behaviour when composing mutations
    it('mutates the state when called inside itself', () => {
      const result = reducer(initialState, { type: 'nested' })
      expect(result.test).toBe('nested-updated')
    })

    it('continues working if an invocation throws', () => {
      expect(() => reducer(initialState, { type: 'throw' })).toThrow()

      const result = reducer(initialState, { type: 'update' })
      expect(result.test).toBe('updated')
      expect(initialState.test).toBe('test')
    })
  })
})

import { createImmerReducer } from './immer'

describe(createImmerReducer.name, () => {
  describe(`created reducer`, () => {
    interface T { test: string }
    const initialState: T = Object.freeze({ test: 'test' })
    const reducer = createImmerReducer<T>((s = initialState, { type }) => {
      if (type === 'update') {
        s.test = 'updated'
      }

      return s
    })

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
  })
})

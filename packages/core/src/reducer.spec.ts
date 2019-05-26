import { getChildReducer, getRootReducer, removeChildReducer, setChildReducer, setChildReducers } from './reducer'

describe('reducer', () => {
  afterEach(() => {
    removeChildReducer('test')
    removeChildReducer('test2')
  })

  describe(getRootReducer.name, () => {
    it('is a dummy reducer if no reducers are registered', () => {
      expect(getRootReducer).not.toThrow()
      expect(getRootReducer()(undefined, { type: '' })).toEqual({})
    })
  })

  describe(setChildReducer.name, () => {
    it('adds a reducer to the root reducer', () => {
      setChildReducer('test', (s = { test: 'test' }) => s)
      expect(getRootReducer()(undefined, { type: '' }).test.test).toBe('test')
    })
  })

  describe(setChildReducers.name, () => {
    it('adds all reducers to the root reducer', () => {
      setChildReducers({
        test: (s = { test: 'test' }) => s,
        test2: (s = { test2: 'test2' }) => s,
      })
      expect(getRootReducer()(undefined, { type: '' }).test.test).toBe('test')
      expect(getRootReducer()(undefined, { type: '' }).test2.test2).toBe('test2')
    })
  })

  describe(getChildReducer.name, () => {
    it('returns the reducer function', () => {
      setChildReducer('test', (c: number = 0) => c + 1)
      const reducer = getChildReducer('test')
      expect(reducer(10, { type: '' })).toBe(11)
    })
  })
})

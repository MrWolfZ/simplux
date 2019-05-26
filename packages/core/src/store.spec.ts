import { createStore } from 'redux'
import { createSimpluxStore, getSimpluxStore, useExistingStore } from './store'

describe('store', () => {
  describe(getSimpluxStore.name, () => {
    it(`creates the store`, () => {
      expect(getSimpluxStore()).toBeDefined()
    })
  })

  describe(useExistingStore.name, () => {
    it(`sets the store`, () => {
      useExistingStore(createStore((c: number = 10) => c + 1), s => s)
      expect(getSimpluxStore().getState()).toBe(11)
    })
  })

  it(`allows setting and getting a reducer`, () => {
    const { setReducer, getReducer } = createSimpluxStore(
      () => undefined!,
      s => s,
    )
    const reducer = (s = {}) => s
    setReducer('test', reducer)
    expect(getReducer('test')).toBe(reducer)
  })
})

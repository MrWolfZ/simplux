import { createStore } from 'redux'
import { getStore, useExistingStore } from './store'

describe('store', () => {
  describe(getStore.name, () => {
    it(`creates the store`, () => {
      expect(getStore()).toBeDefined()
    })
  })

  describe(useExistingStore.name, () => {
    it(`sets the store`, () => {
      useExistingStore(createStore((c: number = 10) => c + 1), s => s)
      expect(getStore().getState()).toBe(11)
    })
  })
})

import { createStore } from 'redux'
import { getSimpluxStore, useExistingStore } from './store'

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
})

import { ReduxStoreProxy } from '@simplux/core'
import { createSelectorsFactory, SelectorsBase, SelectorsFactory, selectorsModuleExtension } from './selectors'

describe('selectors', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  let storeState = {}
  const getStoreStateMock = jest.fn().mockImplementation(() => storeState)
  const getChildReducerMock = jest.fn()
  const setChildReducerMock = jest.fn()

  const storeProxy: ReduxStoreProxy = {
    dispatch: dispatchMock,
    getState: getStoreStateMock,
    getChildReducer: getChildReducerMock,
    setChildReducer: setChildReducerMock,
  }

  beforeEach(() => {
    storeState = {}
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('adds the selectors state container', () => {
      const c: any = {}
      selectorsModuleExtension<number>({
        name: 'test',
        initialState: 0,
      }, storeProxy, c)

      expect(c.selectors.test).toEqual({})
    })

    it('returns an object with the factory function', () => {
      const value = selectorsModuleExtension<number>({
        name: 'test',
        initialState: 0,
      }, storeProxy, {})

      expect(value.createSelectors).toBeDefined()
    })
  })

  describe(`factory`, () => {
    let moduleSelectors: SelectorsBase<number>
    let createSelectors: SelectorsFactory<number>

    beforeEach(() => {
      moduleSelectors = {}
      createSelectors = createSelectorsFactory<number>('test', storeProxy.getState, moduleSelectors)
    })

    it('merges selectors if called multiple times', () => {
      createSelectors({
        plusOne: c => c + 1,
      })

      createSelectors({
        minusOne: c => c - 1,
      })

      expect(moduleSelectors.plusOne).toBeDefined()
      expect(moduleSelectors.minusOne).toBeDefined()
    })

    it('overwrites selectors with the same name when called multiple times', () => {
      const plus1 = (c: number) => c + 1
      const plus2 = (c: number) => c + 2

      createSelectors({
        plus: plus1,
      })

      expect(moduleSelectors.plus).toBe(plus1)

      createSelectors({
        plus: plus2,
      })

      expect(moduleSelectors.plus).toBe(plus2)
    })

    describe(`returned selectors`, () => {
      beforeEach(() => {
        storeState = { test: 20 }
      })

      it('selects the state', () => {
        const { plus, minusOne } = createSelectors({
          plus: (c, amount: number) => c + amount,
          minusOne: c => c - 1,
        })

        expect(plus(10, 5)).toBe(15)
        expect(minusOne(10)).toBe(9)
      })

      it('can be called with bound state', () => {
        const { plus } = createSelectors({
          plus: (c, amount: number) => c + amount,
        })

        expect(plus.bound(5)).toBe(25)
      })
    })
  })
})

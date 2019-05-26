import { SimpluxStore } from '@simplux/core'
import {
  createSelectorsFactory,
  SelectorsBase,
  SelectorsFactory,
  selectorsModuleExtension,
} from './selectors'

describe('selectors', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  let storeState = {}
  const getStoreStateMock = jest.fn().mockImplementation(() => storeState)
  const setReducerMock = jest.fn()
  const getReducerMock = jest.fn()

  const store: SimpluxStore = {
    rootReducer: s => s,
    getState: getStoreStateMock,
    dispatch: dispatchMock,
    subscribe: jest.fn(),
    setReducer: setReducerMock,
    getReducer: getReducerMock,
  }

  beforeEach(() => {
    storeState = {}
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('adds the selectors state container', () => {
      const c: any = {}
      selectorsModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        store,
        c,
      )

      expect(c.selectors.test).toEqual({})
    })

    it('returns an object with the factory function', () => {
      const value = selectorsModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        store,
        {},
      )

      expect(value.createSelectors).toBeDefined()
    })
  })

  describe(`factory`, () => {
    let moduleSelectors: SelectorsBase<number>
    let createSelectors: SelectorsFactory<number>

    beforeEach(() => {
      moduleSelectors = {}
      createSelectors = createSelectorsFactory<number>(
        'test',
        store.getState,
        moduleSelectors,
      )
    })

    it('throws when existing selector is declared again', () => {
      createSelectors({
        plus: c => c + 1,
      })

      expect(() =>
        createSelectors({
          plus: c => c + 2,
        }),
      ).toThrowError(`selector 'plus' is already defined for module 'test'`)
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

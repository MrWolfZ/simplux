import { SimpluxModuleCore, SimpluxStore } from '@simplux/core'
import {
  createSelectorsFactory,
  SelectorsBase,
  SelectorsFactory,
  selectorsModuleExtension,
} from './selectors'

describe('selectors', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  const getStoreStateMock = jest.fn()
  const setReducerMock = jest.fn()
  const getReducerMock = jest.fn()

  let moduleState = {}
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  const storeMock: SimpluxStore = {
    rootReducer: s => s,
    getState: getStoreStateMock,
    dispatch: dispatchMock,
    subscribe: jest.fn(),
    setReducer: setReducerMock,
    getReducer: getReducerMock,
  }

  const moduleMock: SimpluxModuleCore<any> = {
    getState: getModuleStateMock,
    setState: setModuleStateMock,
    subscribeToStateChanges: subscribeToModuleStateChangesMock,
  }

  beforeEach(() => {
    moduleState = {}
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
        storeMock,
        moduleMock,
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
        storeMock,
        moduleMock,
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
        getModuleStateMock,
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
        moduleState = 20
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

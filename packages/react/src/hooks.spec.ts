import { SimpluxModuleCore, SimpluxStore } from '@simplux/core'
import { renderHook } from 'react-hooks-testing-library'
import { reactHooksModuleExtension } from './hooks'

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
    it('returns an object with the hooks', () => {
      const value = reactHooksModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        {},
      )

      expect(value.reactHooks).toBeDefined()
      expect(value.reactHooks.useSelector).toBeDefined()
    })

    describe('returned selector hook', () => {
      it('works', () => {
        moduleState = 10

        const value = reactHooksModuleExtension<number>(
          {
            name: 'test',
            initialState: 0,
          },
          storeMock,
          moduleMock,
          {},
        )

        const { result } = renderHook(() =>
          value.reactHooks.useSelector(c => c),
        )

        expect(result.current).toBe(10)
      })
    })
  })
})

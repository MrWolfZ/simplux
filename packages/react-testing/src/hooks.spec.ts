import { SimpluxModuleCore, SimpluxStore } from '@simplux/core'
import { reactHooksTestingModuleExtension } from './hooks'

describe('hooks', () => {
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
  ; (moduleMock as any).react = {
    hooks: {
      useSelector: () => void 0,
    },
  }

  beforeEach(() => {
    moduleState = {}
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('returns an object with the hooks', () => {
      const value = reactHooksTestingModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        {},
      )

      expect(value.react).toBeDefined()
      expect(value.react.hooks).toBeDefined()
      expect(value.react.hooks.useSelector).toBeDefined()
    })

    it('adds the mutation state container', () => {
      const c: any = {}
      reactHooksTestingModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        c,
      )

      expect(c.reactHooksMocks.test).toEqual({ selectorHook: {} })
    })
  })
})

import { SimpluxModule, SIMPLUX_MODULE } from '@simplux/core'
import { clearAllSimpluxMocks } from './cleanup.js'
import { mockModuleState } from './module.js'

describe('module', () => {
  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const dispatchMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<typeof moduleState>

  beforeEach(() => {
    moduleState = 0
    moduleMock = {
      state: getModuleStateMock as any,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simplux: {
        name: 'test',
        mutations: {},
        dispatch: dispatchMock,
        getReducer: undefined!,
        getState: getModuleStateMock,
      },
      [SIMPLUX_MODULE]: '' as any,
    }

    jest.clearAllMocks()
  })

  afterEach(clearAllSimpluxMocks)

  beforeEach(() => {
    moduleState = 0
  })

  it('sets the module mock state value on the extension state container', () => {
    mockModuleState(moduleMock, 10)

    expect(moduleMock.$simplux.mockStateValue).toBe(10)
  })

  describe('mock state value', () => {
    it('can be cleared', () => {
      const clear = mockModuleState(moduleMock, 10)

      clear()

      expect(moduleMock.$simplux.mockStateValue).toBeUndefined()
    })

    it('can be cleared globally', () => {
      mockModuleState(moduleMock, 10)

      clearAllSimpluxMocks()

      expect(moduleMock.$simplux.mockStateValue).toBeUndefined()
    })
  })
})

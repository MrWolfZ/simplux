import { SimpluxModule, SimpluxModuleInternals } from '@simplux/core'
import { clearAllSimpluxMocks } from './cleanup'
import { mockModuleState } from './module'

describe('module', () => {
  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const dispatchMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)
  let moduleExtensionStateContainer = {} as any

  let moduleMock: SimpluxModule<typeof moduleState> & SimpluxModuleInternals

  beforeEach(() => {
    moduleState = 0
    moduleExtensionStateContainer = { mutations: {} } as any
    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      name: 'test',
      extensionStateContainer: moduleExtensionStateContainer,
      dispatch: dispatchMock,
      getReducer: undefined!,
    }

    jest.clearAllMocks()
  })

  afterEach(clearAllSimpluxMocks)

  beforeEach(() => {
    moduleState = 0
  })

  it('sets the module mock state value on the extension state container', () => {
    mockModuleState(moduleMock, 10)

    expect(moduleExtensionStateContainer.mockStateValue).toBe(10)
  })

  describe('mock state value', () => {
    it('can be cleared', () => {
      const clear = mockModuleState(moduleMock, 10)

      clear()

      expect(moduleExtensionStateContainer.mockStateValue).toBeUndefined()
    })
  })
})

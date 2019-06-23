import { createAsyncTasks } from '@simplux/async'
import { SimpluxModule, SimpluxModuleInternals } from '@simplux/core'
import { mockAsyncTask } from './async-tasks'
import { clearAllSimpluxMocks } from './cleanup'

describe('asyncTasks', () => {
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

  it('call the original task', async () => {
    const mock = jest.fn().mockReturnValue(Promise.resolve())

    const { task } = createAsyncTasks(moduleMock, {
      task: mock,
    })

    await task()

    expect(mock).toHaveBeenCalled()
  })

  it('can be mocked', async () => {
    const { task1, task2 } = createAsyncTasks(moduleMock, {
      task1: () => Promise.resolve(0),
      task2: async (amount: number) => await Promise.resolve(amount),
    })

    const mock1 = jest.fn().mockReturnValue(Promise.resolve(10))
    mockAsyncTask(task1, mock1)

    const mock2 = jest.fn().mockReturnValue(Promise.resolve(20))
    mockAsyncTask(task2, mock2)

    const task1ReturnValue = await task1()
    expect(mock1).toHaveBeenCalled()
    expect(task1ReturnValue).toBe(10)

    const task2ReturnValue = await task2(5)
    expect(mock2).toHaveBeenCalledWith(5)
    expect(task2ReturnValue).toBe(20)
  })

  describe('mocks', () => {
    it('can be cleared', async () => {
      const { task } = createAsyncTasks(moduleMock, {
        task: (amount: number) => Promise.resolve(amount),
      })

      const mock = jest.fn()
      const clear = mockAsyncTask(task, mock)

      await task(10)

      clear()

      await task(5)

      expect(mock).toHaveBeenCalledWith(10)
      expect(mock).toHaveBeenCalledTimes(1)
    })

    it('can be removed all at once', async () => {
      const { task1, task2 } = createAsyncTasks(moduleMock, {
        task1: () => Promise.resolve(0),
        task2: async (amount: number) => await Promise.resolve(amount),
      })

      const mock1 = jest.fn().mockReturnValue(Promise.resolve(10))
      mockAsyncTask(task1, mock1)

      const mock2 = jest.fn().mockReturnValue(Promise.resolve(20))
      mockAsyncTask(task2, mock2)

      await task1()
      await task2(5)

      clearAllSimpluxMocks()

      await task1()
      await task2(5)

      expect(mock1).toHaveBeenCalled()
      expect(mock1).toHaveBeenCalledTimes(1)
      expect(mock2).toHaveBeenCalledWith(5)
      expect(mock2).toHaveBeenCalledTimes(1)
    })

    it('can be removed all at once for multiple modules', async () => {
      const moduleMock2: typeof moduleMock = {
        getState: getModuleStateMock,
        setState: setModuleStateMock,
        subscribeToStateChanges: subscribeToModuleStateChangesMock,
        name: 'test2',
        extensionStateContainer: { mutations: {} },
        dispatch: dispatchMock,
        getReducer: undefined!,
      }

      const { task1 } = createAsyncTasks(moduleMock, {
        task1: () => Promise.resolve(0),
      })

      const { task2 } = createAsyncTasks(moduleMock2, {
        task2: async (amount: number) => await Promise.resolve(amount),
      })

      const mock1 = jest.fn().mockReturnValue(Promise.resolve(10))
      mockAsyncTask(task1, mock1)

      const mock2 = jest.fn().mockReturnValue(Promise.resolve(20))
      mockAsyncTask(task2, mock2)

      await task1()
      await task2(5)

      clearAllSimpluxMocks()

      await task1()
      await task2(5)

      expect(mock1).toHaveBeenCalled()
      expect(mock1).toHaveBeenCalledTimes(1)
      expect(mock2).toHaveBeenCalledWith(5)
      expect(mock2).toHaveBeenCalledTimes(1)
    })
  })
})

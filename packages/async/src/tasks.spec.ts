import { SimpluxModule, SimpluxModuleInternals } from '@simplux/core'
import { createAsyncTasks, ResolvedAsyncTaskInternals } from './tasks'

describe('async tasks', () => {
  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)
  let moduleExtensionStateContainer = {} as any

  let moduleMock: SimpluxModule<typeof moduleState> & SimpluxModuleInternals

  beforeEach(() => {
    moduleState = 0
    moduleExtensionStateContainer = {} as any
    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      name: 'test',
      extensionStateContainer: moduleExtensionStateContainer,
      dispatch: undefined!,
      getReducer: undefined!,
    }

    jest.clearAllMocks()
  })

  describe(`factory`, () => {
    it('adds the async tasks state container', () => {
      createAsyncTasks(moduleMock, {})

      expect(moduleExtensionStateContainer.asyncTasks).toEqual({})
    })

    it('adds the async tasks mocks extension state container', () => {
      createAsyncTasks(moduleMock, {})

      expect(moduleMock.extensionStateContainer.asyncTaskMocks).toBeDefined()
    })

    it('throws when existing async task is declared again', () => {
      createAsyncTasks(moduleMock, {
        task: () => Promise.resolve(),
      })

      expect(() =>
        createAsyncTasks(moduleMock, {
          task: () => Promise.resolve(),
        }),
      ).toThrowError(`async task 'task' is already defined for module 'test'`)
    })

    describe(`returned async tasks`, () => {
      beforeEach(() => {
        moduleState = 20
      })

      it('calls the original task', async () => {
        const mock = jest.fn().mockReturnValue(Promise.resolve())

        const { task } = createAsyncTasks(moduleMock, {
          task: mock,
        })

        await task()

        expect(mock).toHaveBeenCalled()
      })

      it('calls the original task with parameters', async () => {
        const mock = jest.fn().mockReturnValue(Promise.resolve())

        const { task } = createAsyncTasks(moduleMock, {
          // tslint:disable-next-line: no-unnecessary-callback-wrapper (for type annotations)
          task: async (arg1: string, arg2: { nestedArg: boolean }) =>
            await mock(arg1, arg2),
        })

        await task('foo', { nestedArg: true })

        expect(mock).toHaveBeenCalledWith('foo', { nestedArg: true })
      })

      it('can be composed', async () => {
        const mock = jest
          .fn()
          .mockImplementation((amount: number) => Promise.resolve(amount))

        const { task1, task2 } = createAsyncTasks(moduleMock, {
          task1: async (): Promise<number> => await mock(5),
          task2: async (amount: number): Promise<number> => {
            const i1 = await task1()
            return i1 + amount
          },
        })

        const { task3 } = createAsyncTasks(moduleMock, {
          task3: async () => await task2(10),
        })

        expect(await task2(20)).toBe(25)
        expect(await task3()).toBe(15)
      })

      it('calls the mock if it is defined', async () => {
        const { task } = createAsyncTasks(moduleMock, {
          // tslint:disable-next-line: variable-name (extra args for assertions)
          task: (_arg1: string, _arg2: { nestedArg: boolean }) =>
            Promise.resolve(),
        })

        const mock = jest.fn().mockReturnValue(Promise.resolve())
        ; (moduleMock.extensionStateContainer.asyncTaskMocks as any)[
          task.name
        ] = mock

        await task('foo', { nestedArg: true })

        expect(mock).toHaveBeenCalledWith('foo', { nestedArg: true })
      })

      it('has the same name as the async task', () => {
        const { task } = createAsyncTasks(moduleMock, {
          task: () => Promise.resolve(),
        })

        expect(task.name).toBe('task')
      })

      it('has the same taskName as the async task', () => {
        const { task } = createAsyncTasks(moduleMock, {
          task: () => Promise.resolve(),
        })

        expect(
          ((task as unknown) as ResolvedAsyncTaskInternals<number>).taskName,
        ).toBe('task')
      })

      it('has a reference to the owning module', () => {
        const { task } = createAsyncTasks(moduleMock, {
          task: () => Promise.resolve(),
        })

        expect(
          ((task as unknown) as ResolvedAsyncTaskInternals<number>)
            .owningModule,
        ).toBe(moduleMock)
      })
    })
  })
})

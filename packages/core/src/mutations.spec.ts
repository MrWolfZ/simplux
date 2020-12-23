import { createImmerReducer } from './immer.js'
import { SimpluxModule, SIMPLUX_MODULE } from './module.js'
import { createMutations, MutationDefinitions } from './mutations.js'
import { createModuleReducer } from './reducer.js'

declare class Event {
  constructor(arg: any)
}

declare const window: any

describe('mutations', () => {
  let nodeEnv: string | undefined
  const dispatchMock = jest.fn().mockImplementation((a) => a)
  const getReducerMock = jest.fn()

  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<number>

  beforeEach(() => {
    moduleState = 0
    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simpluxInternals: {
        name: 'test',
        mockStateValue: undefined,
        mutations: {},
        mutationMocks: {},
        dispatch: dispatchMock,
        getReducer: getReducerMock,
      },
      [SIMPLUX_MODULE]: undefined!,
    }
    jest.clearAllMocks()
    nodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv
  })

  describe(`factory`, () => {
    let moduleMutations: MutationDefinitions<number>
    let moduleReducerSpy: jest.Mock<
      number,
      [number | undefined, { type: string }]
    >

    beforeEach(() => {
      moduleMutations = moduleMock.$simpluxInternals.mutations as any
      const moduleReducer = createImmerReducer(
        createModuleReducer('test', moduleState, moduleMutations),
      )

      moduleReducerSpy = jest.fn().mockImplementation(moduleReducer)
      getReducerMock.mockImplementation(() => moduleReducerSpy)
    })

    it('creates the mutation mocks extension state container', () => {
      createMutations(moduleMock, {
        increment: (c) => c + 1,
      })

      expect(moduleMock.$simpluxInternals.mutationMocks).toBeDefined()
    })

    it('throws when existing mutation is declared again', () => {
      createMutations(moduleMock, {
        increment: (c) => c + 1,
      })

      expect(() =>
        createMutations(moduleMock, {
          increment: (c) => c + 2,
        }),
      ).toThrowError(
        `mutation 'increment' is already defined for module 'test'`,
      )
    })

    it('does not throw when existing mutation is declared again in production', () => {
      process.env.NODE_ENV = 'production'

      createMutations(moduleMock, {
        increment: (c) => c + 1,
      })

      expect(() =>
        createMutations(moduleMock, {
          increment: (c) => c + 2,
        }),
      ).not.toThrowError()
    })

    describe(`returned mutations`, () => {
      it('dispatch action when called without args', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        increment()

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: [],
        })
      })

      it('dispatch action when called with args', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c, _: string, _2: { nestedArg: boolean }) => c + 1,
        })

        increment('foo', { nestedArg: true })

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('returns the updated store state', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        moduleState = 1
        const updatedState = increment()
        expect(updatedState).toBe(1)
      })

      it('calls the mutation when called with state', () => {
        const mutationSpy = jest.fn().mockImplementation((c: number) => c + 1)

        const { increment } = createMutations(moduleMock, {
          // tslint:disable-next-line: no-unnecessary-callback-wrapper (for type annotations)
          increment: (c, arg1: string, arg2: { nestedArg: boolean }) =>
            mutationSpy(c, arg1, arg2),
        })

        increment.withState(10, 'foo', { nestedArg: true })

        expect(mutationSpy).toHaveBeenCalledWith(10, 'foo', { nestedArg: true })
      })

      it('calls the reducer when called with state', () => {
        const { increment } = createMutations(moduleMock, {
          // tslint:disable-next-line: no-unnecessary-callback-wrapper variable-name
          increment: (c, _arg1: string, _arg2: { nestedArg: boolean }) => c + 1,
        })

        increment.withState(10, 'foo', { nestedArg: true })

        expect(moduleReducerSpy).toHaveBeenCalledWith(10, {
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('does not mutate the state when called with state', () => {
        const objectState = { prop: 'value' }
        moduleState = objectState as any

        const { update } = createMutations(
          (moduleMock as any) as SimpluxModule<typeof objectState>,
          {
            // tslint:disable-next-line: no-unnecessary-callback-wrapper variable-name
            update: (state, _arg1: string, _arg2: { nestedArg: boolean }) => {
              state.prop = 'updated'
            },
          },
        )

        const updatedState = update.withState(objectState, 'foo', {
          nestedArg: true,
        })

        expect(updatedState.prop).toBe('updated')
        expect(objectState.prop).toBe('value')
      })

      it('returns the action if called as action creator', () => {
        const mutationSpy = jest.fn()

        const { increment } = createMutations(moduleMock, {
          // tslint:disable-next-line: no-unnecessary-callback-wrapper (for type annotations)
          increment: (c, arg1: string, arg2: { nestedArg: boolean }) =>
            mutationSpy(c, arg1, arg2),
        })

        const action = increment.asAction('foo', { nestedArg: true })

        expect(mutationSpy).not.toHaveBeenCalled()
        expect(action).toEqual({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('calls the mock if it is defined', () => {
        const { increment } = createMutations(moduleMock, {
          // tslint:disable-next-line: variable-name (extra args for assertions)
          increment: (c, _arg1: string, _arg2: { nestedArg: boolean }) => c,
        })

        const mock = jest.fn()
        moduleMock.$simpluxInternals.mutationMocks[increment.name] = mock

        increment('foo', { nestedArg: true })

        expect(mock).toHaveBeenCalledWith('foo', { nestedArg: true })
        expect(dispatchMock).not.toHaveBeenCalled()
      })

      it('has the same name as the mutation', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c,
        })

        expect(increment.name).toBe('increment')
      })

      it('has the type of the mutation', () => {
        const { increment, incrementBy } = createMutations(moduleMock, {
          increment: (c) => c,
          incrementBy: (c) => c,
        })

        expect(increment.type).toBe('@simplux/test/mutation/increment')
        expect(incrementBy.type).toBe('@simplux/test/mutation/incrementBy')
      })

      it('has the same mutationName as the mutation', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c,
        })

        expect(increment.mutationName).toBe('increment')
      })

      it('has a reference to the owning module', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c,
        })

        expect(increment.owningModule).toBe(moduleMock)
      })

      it('ignores event arg in first position', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        const incrementAny = increment as any
        incrementAny(new Event('my event'))

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: [],
        })
      })

      it('ignores event-like arg in first position', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        const incrementAny = increment as any
        incrementAny({
          target: null,
          defaultPrevented: null,
          currentTarget: null,
        })

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: [],
        })
      })

      it('works in environments where Event is not defined', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        const Evt = window.Event
        delete window.Event
        increment()
        window.Event = Evt

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: [],
        })
      })

      it('throws an error for function arguments', () => {
        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        const incrementAny = increment as any

        expect(() => incrementAny(() => {})).toThrowError(
          /function.*serializable/,
        )
      })

      it('does not throw an error for function arguments in production', () => {
        process.env.NODE_ENV = 'production'

        const { increment } = createMutations(moduleMock, {
          increment: (c) => c + 1,
        })

        const incrementAny = increment as any

        expect(() => incrementAny(() => {})).not.toThrowError(
          /function.*serializable/,
        )
      })

      it('throws an error when calling a nested mutation directly', () => {
        dispatchMock.mockImplementation(({ mutationName }) => {
          const moduleMutations = moduleMock.$simpluxInternals.mutations
          const mutation = moduleMutations[mutationName]
          mutation(moduleMock.getState())
        })

        const { increment, increment2 } = createMutations(moduleMock, {
          increment: (c) => c + 1,
          increment2: () => {
            increment()
            increment()
          },
        })

        expect(increment2).toThrowError(
          /mutation .* was attempted to be dispatched from within mutation/,
        )
      })
    })
  })
})

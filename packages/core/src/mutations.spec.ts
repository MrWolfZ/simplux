import { SimpluxModule, SimpluxModuleInternals } from './module'
import {
  createModuleReducer,
  createMutations,
  MutationsBase,
  ResolvedMutationInternals,
} from './mutations'

declare class Event {
  constructor(arg: any)
}

declare const window: any

describe('mutations', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  const getReducerMock = jest.fn()

  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<number> & SimpluxModuleInternals

  beforeEach(() => {
    moduleState = 0
    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      name: 'test',
      extensionStateContainer: { mutations: { test: {} } },
      dispatch: dispatchMock,
      getReducer: getReducerMock,
    }
    jest.clearAllMocks()
  })

  describe(`factory`, () => {
    let moduleMutations: MutationsBase<number>
    let moduleReducerSpy: jest.Mock<
      number,
      [number | undefined, { type: string }]
    >

    beforeEach(() => {
      moduleMutations = moduleMock.extensionStateContainer.mutations as any
      const moduleReducer = createModuleReducer(
        'test',
        moduleState,
        moduleMutations,
      )

      moduleReducerSpy = jest.fn().mockImplementation(moduleReducer)
      getReducerMock.mockImplementation(() => moduleReducerSpy)
    })

    it('throws when existing mutation is declared again', () => {
      createMutations(moduleMock, {
        increment: c => c + 1,
      })

      expect(() =>
        createMutations(moduleMock, {
          increment: c => c + 2,
        }),
      ).toThrowError(
        `mutation 'increment' is already defined for module 'test'`,
      )
    })

    describe(`returned mutations`, () => {
      it('dispatch action when called without args', () => {
        const { increment } = createMutations(moduleMock, {
          increment: c => c + 1,
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
          increment: c => c + 1,
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

        increment.withState(10)('foo', { nestedArg: true })

        expect(mutationSpy).toHaveBeenCalledWith(10, 'foo', { nestedArg: true })
      })

      it('calls the reducer when called with state', () => {
        const { increment } = createMutations(moduleMock, {
          // tslint:disable-next-line: no-unnecessary-callback-wrapper variable-name
          increment: (c, _arg1: string, _arg2: { nestedArg: boolean }) => c + 1,
        })

        increment.withState(10)('foo', { nestedArg: true })

        expect(moduleReducerSpy).toHaveBeenCalledWith(10, {
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('returns the action if called as action creator', () => {
        const mutationSpy = jest.fn()

        const { increment } = createMutations(moduleMock, {
          // tslint:disable-next-line: no-unnecessary-callback-wrapper (for type annotations)
          increment: (c, arg1: string, arg2: { nestedArg: boolean }) =>
            mutationSpy(c, arg1, arg2),
        })

        const action = increment.asActionCreator('foo', { nestedArg: true })

        expect(mutationSpy).not.toHaveBeenCalled()
        expect(action).toEqual({
          type: '@simplux/test/mutation/increment',
          mutationName: 'increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('has the same name as the mutation', () => {
        const { increment } = createMutations(moduleMock, {
          increment: c => c,
        })

        expect(increment.name).toBe('increment')
      })

      it('has the type of the mutation', () => {
        const { increment, incrementBy } = createMutations(moduleMock, {
          increment: c => c,
          incrementBy: c => c,
        })

        expect(increment.type).toBe('@simplux/test/mutation/increment')
        expect(incrementBy.type).toBe('@simplux/test/mutation/incrementBy')
      })

      it('has the same mutationName as the mutation', () => {
        const { increment } = createMutations(moduleMock, {
          increment: c => c,
        })

        expect(
          ((increment as unknown) as ResolvedMutationInternals<number>)
            .mutationName,
        ).toBe('increment')
      })

      it('has a reference to the owning module', () => {
        const { increment } = createMutations(moduleMock, {
          increment: c => c,
        })

        expect(
          ((increment as unknown) as ResolvedMutationInternals<number>)
            .owningModule,
        ).toBe(moduleMock)
      })

      it('ignores event arg in first position', () => {
        const { increment } = createMutations(moduleMock, {
          increment: c => c + 1,
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
          increment: c => c + 1,
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
          increment: c => c + 1,
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
    })
  })

  describe(`reducer`, () => {
    const reducer = createModuleReducer('test', 10, {
      increment: c => c + 1,
    })

    it('updates the state', () => {
      const result = reducer(undefined, {
        type: '@simplux/test/mutation/increment',
        mutationName: 'increment',
        args: [],
      })
      expect(result).toBe(11)
    })

    it('throws if the mutation does not exist', () => {
      expect(() =>
        reducer(undefined, {
          type: '@simplux/test/mutation/doesNotExist',
          mutationName: 'doesNotExist',
          args: [],
        }),
      ).toThrowError(/does not exist/)
    })

    it('ignores unknown actions', () => {
      const result = reducer(undefined, { type: 'foo' })
      expect(result).toBe(10)
    })

    it('returns state if it gets mutated without getting returned', () => {
      const mutatingReducer = createModuleReducer(
        'test',
        { test: 'test' },
        {
          update: state => {
            state.test = 'updated'
            return undefined!
          },
        },
      )

      const result = mutatingReducer(undefined, {
        type: '@simplux/test/mutation/update',
        mutationName: 'update',
        args: [],
      })
      expect(result).toEqual({ test: 'updated' })
    })

    it('freezes the state if feature flag is set', () => {
      const freezingReducer = createModuleReducer(
        'test',
        {
          test: 'test',
        },
        {
          update: state => {
            state.test = 'updated'
            return state
          },
        },
      )

      expect(() =>
        freezingReducer(
          undefined,
          {
            type: '@simplux/test/mutation/update',
            mutationName: 'update',
            args: [],
          },
          () => true,
        ),
      ).toThrowError(/Cannot assign to read only property/)
    })
  })
})

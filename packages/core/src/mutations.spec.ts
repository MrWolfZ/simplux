import { SimpluxModuleCore } from './module'
import {
  createModuleReducer,
  createMutationsFactory,
  MutationsBase,
  MutationsFactory,
  mutationsModuleExtension,
} from './mutations'
import { SimpluxStore } from './store'

declare class Event {
  constructor(arg: any)
}

declare const window: any

describe('mutations', () => {
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
    it('creates and sets the module reducer', () => {
      mutationsModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        {},
      )

      expect(setReducerMock).toHaveBeenCalledWith('test', expect.any(Function))
    })

    it('adds the mutation state container', () => {
      const c: any = {}
      mutationsModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        c,
      )

      expect(c.mutations.test).toEqual({})
    })

    it('returns an object with the factory function', () => {
      const value = mutationsModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        {},
      )

      expect(value.createMutations).toBeDefined()
    })
  })

  describe(`factory`, () => {
    let moduleMutations: MutationsBase<number>
    let createMutations: MutationsFactory<number>
    let moduleReducerSpy: jest.Mock<
      number,
      [number | undefined, { type: string }]
    >

    beforeEach(() => {
      moduleMutations = {}
      const moduleReducer = createModuleReducer(
        'test',
        moduleState as any,
        moduleMutations,
      )

      moduleReducerSpy = jest.fn().mockImplementation(moduleReducer)
      createMutations = createMutationsFactory<number>(
        'test',
        getModuleStateMock,
        dispatchMock,
        moduleMutations,
        () => moduleReducerSpy,
      )
    })

    it('throws when existing mutation is declared again', () => {
      createMutations({
        increment: c => c + 1,
      })

      expect(() =>
        createMutations({
          increment: c => c + 2,
        }),
      ).toThrowError(
        `mutation 'increment' is already defined for module 'test'`,
      )
    })

    describe(`returned mutations`, () => {
      beforeEach(() => {
        moduleState = 0
      })

      it('dispatch action when called without args', () => {
        const { increment } = createMutations({
          increment: c => c + 1,
        })

        increment()

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          args: [],
        })
      })

      it('dispatch action when called with args', () => {
        const { increment } = createMutations({
          increment: (c, _: string, _2: { nestedArg: boolean }) => c + 1,
        })

        increment('foo', { nestedArg: true })

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('returns the updated store state', () => {
        const { increment } = createMutations({
          increment: c => c + 1,
        })

        moduleState = 1
        const updatedState = increment()
        expect(updatedState).toBe(1)
      })

      it('calls the mutation when called with state', () => {
        const mutationSpy = jest.fn().mockImplementation((c: number) => c + 1)

        const { increment } = createMutations({
          // tslint:disable-next-line: no-unnecessary-callback-wrapper (for type annotations)
          increment: (c, arg1: string, arg2: { nestedArg: boolean }) =>
            mutationSpy(c, arg1, arg2),
        })

        increment.withState(10)('foo', { nestedArg: true })

        expect(mutationSpy).toHaveBeenCalledWith(10, 'foo', { nestedArg: true })
      })

      it('calls the reducer when called with state', () => {
        const { increment } = createMutations({
          // tslint:disable-next-line: no-unnecessary-callback-wrapper variable-name
          increment: (c, _arg1: string, _arg2: { nestedArg: boolean }) => c + 1,
        })

        increment.withState(10)('foo', { nestedArg: true })

        expect(moduleReducerSpy).toHaveBeenCalledWith(10, {
          type: '@simplux/test/mutation/increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('returns the action if called as action creator', () => {
        const mutationSpy = jest.fn()

        const { increment } = createMutations({
          // tslint:disable-next-line: no-unnecessary-callback-wrapper (for type annotations)
          increment: (c, arg1: string, arg2: { nestedArg: boolean }) =>
            mutationSpy(c, arg1, arg2),
        })

        const action = increment.asActionCreator('foo', { nestedArg: true })

        expect(mutationSpy).not.toHaveBeenCalled()
        expect(action).toEqual({
          type: '@simplux/test/mutation/increment',
          args: ['foo', { nestedArg: true }],
        })
      })

      it('has the same name as the mutation', () => {
        const { increment } = createMutations({
          increment: c => c,
        })

        expect(increment.name).toBe('increment')
      })

      it('ignores event arg in first position', () => {
        const { increment } = createMutations({
          increment: c => c + 1,
        })

        const incrementAny = increment as any
        incrementAny(new Event('my event'))

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
          args: [],
        })
      })

      it('works in environments where Event is not defined', () => {
        const { increment } = createMutations({
          increment: c => c + 1,
        })

        const Evt = window.Event
        delete window.Event
        increment()
        window.Event = Evt

        expect(dispatchMock).toHaveBeenCalledWith({
          type: '@simplux/test/mutation/increment',
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
        args: [],
      })
      expect(result).toBe(11)
    })

    it('throws if the mutation does not exist', () => {
      expect(() =>
        reducer(undefined, {
          type: '@simplux/test/mutation/doesNotExist',
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
            args: [],
          },
          () => true,
        ),
      ).toThrowError(/Cannot assign to read only property/)
    })
  })
})

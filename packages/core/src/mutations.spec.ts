import {
  createModuleReducer,
  createMutationsFactory,
  MutationsBase,
  MutationsFactory,
  mutationsModuleExtension,
} from './mutations'
import { SimpluxStore } from './store'

describe('mutations', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  let storeState = {}
  const getStoreStateMock = jest.fn().mockImplementation(() => storeState)
  const setReducerMock = jest.fn()
  const getReducerMock = jest.fn()

  const store: SimpluxStore = {
    rootReducer: s => s,
    getState: getStoreStateMock,
    dispatch: dispatchMock,
    subscribe: jest.fn(),
    setReducer: setReducerMock,
    getReducer: getReducerMock,
  }

  beforeEach(() => {
    storeState = {}
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('creates and sets the module reducer', () => {
      mutationsModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        store,
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
        store,
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
        store,
        {},
      )

      expect(value.createMutations).toBeDefined()
    })
  })

  describe(`factory`, () => {
    let moduleMutations: MutationsBase<number>
    let createMutations: MutationsFactory<number>

    beforeEach(() => {
      moduleMutations = {}
      createMutations = createMutationsFactory<number>(
        'test',
        store,
        moduleMutations,
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
        storeState = { test: 0 }
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

        storeState = { test: 1 }
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

      it('returns the state when called with state and not mutation does not return state', () => {
        const mutatingCreateMutations = createMutationsFactory<{
          test: string;
        }>('test', store, {})

        const { update } = mutatingCreateMutations({
          update: state => {
            state.test = 'updated'
            return undefined!
          },
        })

        const result = update.withState({ test: 'test' })()
        expect(result).toEqual({ test: 'updated' })
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
  })
})

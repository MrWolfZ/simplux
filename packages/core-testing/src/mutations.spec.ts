import {
  MutationsFactory,
  SimpluxModuleCore,
  SimpluxStore,
} from '@simplux/core'
import {
  createMutationsFactoryWithTestingExtras,
  MutationsMocks,
  mutationsTestingModuleExtension,
} from './mutations'

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
  ; (moduleMock as any).createMutations = () => ({})

  beforeEach(() => {
    moduleState = {}
    jest.clearAllMocks()
  })

  describe(`module extension`, () => {
    it('adds the mutation state container', () => {
      const c: any = {}
      mutationsTestingModuleExtension<number>(
        {
          name: 'test',
          initialState: 0,
        },
        storeMock,
        moduleMock,
        c,
      )

      expect(c.mutationsMocks.test).toEqual({})
    })

    it('returns an object with the factory function', () => {
      const value = mutationsTestingModuleExtension<number>(
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
    let moduleMutationsMocks: MutationsMocks
    let createMutations: MutationsFactory<number>
    let incrementBySpy: jest.Mock

    beforeEach(() => {
      moduleMutationsMocks = {}

      incrementBySpy = jest.fn()

      createMutations = createMutationsFactoryWithTestingExtras<number>(
        () =>
          ({
            increment: () => 100,
            incrementBy: incrementBySpy,
          } as any),
        moduleMutationsMocks,
      )
    })

    describe(`returned mutations`, () => {
      beforeEach(() => {
        moduleState = 0
      })

      it('can be mocked', () => {
        const { increment, incrementBy } = createMutations({
          increment: c => c + 1,
          incrementBy: (c, amount: number) => c + amount,
        })

        const incrementSpy = increment.setMock(jest.fn().mockReturnValue(10))
        incrementBySpy = incrementBy.setMock(jest.fn().mockReturnValue(20))

        const incrementReturnValue = increment()
        expect(incrementSpy).toHaveBeenCalled()
        expect(incrementReturnValue).toBe(10)

        const incrementByReturnValue = incrementBy(5)
        expect(incrementBySpy).toHaveBeenCalledWith(5)
        expect(incrementByReturnValue).toBe(20)
      })

      describe('mocks', () => {
        it('can be removed', () => {
          const { incrementBy } = createMutations({
            incrementBy: (c, amount: number) => c + amount,
          })

          const spy = incrementBy.setMock(jest.fn())

          incrementBy.removeMock()

          incrementBy(5)
          expect(incrementBySpy).toHaveBeenCalledWith(5)
          expect(spy).not.toHaveBeenCalled()
        })
      })
    })
  })
})

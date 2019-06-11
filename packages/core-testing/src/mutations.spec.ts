import {
  MutationsFactory,
  SimpluxModuleCore,
  SimpluxStore,
} from '@simplux/core'
import {
  createMutationsFactoryWithTestingExtras,
  mockMutation,
  mockMutationOnce,
  mutationsTestingModuleExtension,
  removeAllMutationMocks,
  removeMutationMock,
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
    let createMutations: MutationsFactory<number>
    let incrementSpy: jest.Mock
    let incrementBySpy: jest.Mock

    beforeEach(() => {
      incrementSpy = jest.fn()
      incrementBySpy = jest.fn()

      {
        (incrementSpy as any).type = 'incrementSpy'
        ; (incrementBySpy as any).type = 'incrementBySpy'
      }

      createMutations = createMutationsFactoryWithTestingExtras<number>(
        () =>
          ({
            increment: incrementSpy,
            incrementBy: incrementBySpy,
          } as any),
      )
    })

    afterEach(removeAllMutationMocks)

    describe(`returned mutations`, () => {
      beforeEach(() => {
        moduleState = 0
      })

      it('call the original mutation', () => {
        const { incrementBy } = createMutations({
          incrementBy: (c, amount: number) => c + amount,
        })

        incrementBySpy.mockReturnValueOnce(200)

        const incrementByReturnValue = incrementBy(5)
        expect(incrementBySpy).toHaveBeenCalledWith(5)
        expect(incrementByReturnValue).toBe(200)
      })

      it('can be mocked', () => {
        const { increment, incrementBy } = createMutations({
          increment: c => c + 1,
          incrementBy: (c, amount: number) => c + amount,
        })

        incrementSpy = mockMutation(increment, jest.fn().mockReturnValue(10))

        incrementBySpy = mockMutation(
          incrementBy,
          jest.fn().mockReturnValue(20),
        )

        const incrementReturnValue = increment()
        expect(incrementSpy).toHaveBeenCalled()
        expect(incrementReturnValue).toBe(10)

        const incrementByReturnValue = incrementBy(5)
        expect(incrementBySpy).toHaveBeenCalledWith(5)
        expect(incrementByReturnValue).toBe(20)
      })

      it('can be mocked once', () => {
        const { incrementBy } = createMutations({
          incrementBy: (c, amount: number) => c + amount,
        })

        const spy = mockMutationOnce(incrementBy, jest.fn())

        incrementBy(10)
        incrementBy(5)

        expect(spy).toHaveBeenCalledWith(10)
        expect(incrementBySpy).toHaveBeenCalledWith(5)
      })

      it('can be mocked twice', () => {
        const { incrementBy } = createMutations({
          incrementBy: (c, amount: number) => c + amount,
        })

        const spy = mockMutation(incrementBy, jest.fn(), 2)

        incrementBy(10)
        incrementBy(20)
        incrementBy(5)

        expect(spy).toHaveBeenCalledWith(10)
        expect(spy).toHaveBeenCalledWith(20)
        expect(incrementBySpy).toHaveBeenCalledWith(5)
      })

      describe('mocks', () => {
        it('can be removed', () => {
          const { incrementBy } = createMutations({
            incrementBy: (c, amount: number) => c + amount,
          })

          const spy = mockMutation(incrementBy, jest.fn())

          incrementBy(10)

          removeMutationMock(incrementBy)

          incrementBy(5)
          expect(incrementBySpy).toHaveBeenCalledWith(5)
          expect(spy).toHaveBeenCalledTimes(1)
        })

        it('can be removed all at once', () => {
          const { increment, incrementBy } = createMutations({
            increment: c => c + 1,
            incrementBy: (c, amount: number) => c + amount,
          })

          const spy1 = mockMutation(increment, jest.fn())
          const spy2 = mockMutation(incrementBy, jest.fn())

          increment()
          incrementBy(10)

          removeAllMutationMocks()

          increment()
          incrementBy(5)

          expect(incrementSpy).toHaveBeenCalled()
          expect(incrementBySpy).toHaveBeenCalledWith(5)
          expect(spy1).toHaveBeenCalledTimes(1)
          expect(spy2).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})

import {
  createMutations,
  SimpluxModule,
  SimpluxModuleInternals,
} from '@simplux/core'
import {
  mockMutation,
  mockMutationOnce,
  removeAllMutationMocks,
  removeMutationMock,
} from './mutations'

describe('mutations', () => {
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

  describe(`factory`, () => {
    afterEach(removeAllMutationMocks)

    describe(`returned mutations`, () => {
      beforeEach(() => {
        moduleState = 0
      })

      it('call the original mutation', () => {
        const { incrementBy } = createMutations(moduleMock, {
          incrementBy: (c, amount: number) => c + amount,
        })

        incrementBy(5)

        expect(dispatchMock).toHaveBeenCalledWith(
          incrementBy.asActionCreator(5),
        )
      })

      it('can be mocked', () => {
        const { increment, incrementBy } = createMutations(moduleMock, {
          increment: c => c + 1,
          incrementBy: (c, amount: number) => c + amount,
        })

        const incrementSpy = mockMutation(
          increment,
          jest.fn().mockReturnValue(10),
        )

        const incrementBySpy = mockMutation(
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
        const { incrementBy } = createMutations(moduleMock, {
          incrementBy: (c, amount: number) => c + amount,
        })

        const spy = mockMutationOnce(incrementBy, jest.fn())

        incrementBy(10)
        incrementBy(5)

        expect(spy).toHaveBeenCalledWith(10)
        expect(dispatchMock).toHaveBeenCalledWith(
          incrementBy.asActionCreator(5),
        )
      })

      it('can be mocked twice', () => {
        const { incrementBy } = createMutations(moduleMock, {
          incrementBy: (c, amount: number) => c + amount,
        })

        const spy = mockMutation(incrementBy, jest.fn(), 2)

        incrementBy(10)
        incrementBy(20)
        incrementBy(5)

        expect(spy).toHaveBeenCalledWith(10)
        expect(spy).toHaveBeenCalledWith(20)
        expect(dispatchMock).toHaveBeenCalledWith(
          incrementBy.asActionCreator(5),
        )
      })

      describe('mocks', () => {
        it('can be removed', () => {
          const { incrementBy } = createMutations(moduleMock, {
            incrementBy: (c, amount: number) => c + amount,
          })

          const spy = mockMutation(incrementBy, jest.fn())

          incrementBy(10)

          removeMutationMock(incrementBy)

          incrementBy(5)
          expect(dispatchMock).toHaveBeenCalledWith(
            incrementBy.asActionCreator(5),
          )
          expect(spy).toHaveBeenCalledTimes(1)
        })

        it('can be removed all at once', () => {
          const { increment, incrementBy } = createMutations(moduleMock, {
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

          expect(dispatchMock).toHaveBeenCalledWith(increment.asActionCreator())
          expect(dispatchMock).toHaveBeenCalledWith(
            incrementBy.asActionCreator(5),
          )
          expect(spy1).toHaveBeenCalledTimes(1)
          expect(spy2).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})

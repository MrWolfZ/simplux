import { createMutations, SimpluxModule } from '@simplux/core'
import { clearAllSimpluxMocks } from './cleanup'
import { mockMutation } from './mutations'

describe('mutations', () => {
  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const dispatchMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<typeof moduleState>

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
        selectors: {},
        dispatch: dispatchMock,
        getReducer: undefined!,
      },
    }

    jest.clearAllMocks()
  })

  afterEach(clearAllSimpluxMocks)

  beforeEach(() => {
    moduleState = 0
  })

  it('call the original mutation', () => {
    const { incrementBy } = createMutations(moduleMock, {
      incrementBy: (c, amount: number) => c + amount,
    })

    incrementBy(5)

    expect(dispatchMock).toHaveBeenCalledWith(incrementBy.asAction(5))
  })

  it('can be mocked', () => {
    const { increment, incrementBy } = createMutations(moduleMock, {
      increment: c => c + 1,
      incrementBy: (c, amount: number) => c + amount,
    })

    const incrementSpy = jest.fn().mockReturnValue(10)
    mockMutation(increment, incrementSpy)

    const incrementBySpy = jest.fn().mockReturnValue(20)
    mockMutation(incrementBy, incrementBySpy)

    const incrementReturnValue = increment()
    expect(incrementSpy).toHaveBeenCalled()
    expect(incrementReturnValue).toBe(10)

    const incrementByReturnValue = incrementBy(5)
    expect(incrementBySpy).toHaveBeenCalledWith(5)
    expect(incrementByReturnValue).toBe(20)
  })

  describe('mocks', () => {
    it('can be cleared', () => {
      const { incrementBy } = createMutations(moduleMock, {
        incrementBy: (c, amount: number) => c + amount,
      })

      const spy = jest.fn()
      const clear = mockMutation(incrementBy, spy)

      incrementBy(10)

      clear()

      incrementBy(5)
      expect(dispatchMock).toHaveBeenCalledWith(incrementBy.asAction(5))
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('can be removed all at once', () => {
      const { increment, incrementBy } = createMutations(moduleMock, {
        increment: c => c + 1,
        incrementBy: (c, amount: number) => c + amount,
      })

      const spy1 = jest.fn()
      mockMutation(increment, spy1)
      const spy2 = jest.fn()
      mockMutation(incrementBy, spy2)

      increment()
      incrementBy(10)

      clearAllSimpluxMocks()

      increment()
      incrementBy(5)

      expect(dispatchMock).toHaveBeenCalledWith(increment.asAction())
      expect(dispatchMock).toHaveBeenCalledWith(incrementBy.asAction(5))
      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
    })

    it('can be removed all at once for multiple modules', () => {
      const moduleMock2: typeof moduleMock = {
        getState: getModuleStateMock,
        setState: setModuleStateMock,
        subscribeToStateChanges: subscribeToModuleStateChangesMock,
        $simpluxInternals: {
          name: 'test2',
          mockStateValue: undefined,
          mutations: {},
          mutationMocks: {},
          selectors: {},
          dispatch: dispatchMock,
          getReducer: undefined!,
        },
      }

      const { increment, incrementBy } = createMutations(moduleMock, {
        increment: c => c + 1,
        incrementBy: (c, amount: number) => c + amount,
      })

      const {
        increment: increment2,
        incrementBy: incrementBy2,
      } = createMutations(moduleMock2, {
        increment: c => c + 1,
        incrementBy: (c, amount: number) => c + amount,
      })

      const spy1 = jest.fn()
      mockMutation(increment, spy1)
      const spy2 = jest.fn()
      mockMutation(incrementBy, spy2)
      const spy3 = jest.fn()
      mockMutation(increment2, spy3)
      const spy4 = jest.fn()
      mockMutation(incrementBy2, spy4)

      increment()
      incrementBy(10)
      increment2()
      incrementBy2(20)

      clearAllSimpluxMocks()

      increment()
      incrementBy(5)
      increment2()
      incrementBy2(15)

      expect(dispatchMock).toHaveBeenCalledWith(increment.asAction())
      expect(dispatchMock).toHaveBeenCalledWith(incrementBy.asAction(5))

      expect(dispatchMock).toHaveBeenCalledWith(increment2.asAction())
      expect(dispatchMock).toHaveBeenCalledWith(incrementBy2.asAction(15))

      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
      expect(spy3).toHaveBeenCalledTimes(1)
      expect(spy4).toHaveBeenCalledTimes(1)
    })
  })
})

import { createSelectors, SimpluxModule, SIMPLUX_MODULE } from '@simplux/core'
import { clearAllSimpluxMocks } from './cleanup.js'
import { mockSelector } from './selectors.js'

describe('selectors', () => {
  let moduleState = 20
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const dispatchMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<typeof moduleState>

  beforeEach(() => {
    moduleState = 20
    moduleMock = {
      state: getModuleStateMock as any,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simplux: {
        name: 'test',
        mutations: {},
        dispatch: dispatchMock,
        getReducer: undefined!,
        getState: getModuleStateMock,
      },
      [SIMPLUX_MODULE]: undefined!,
    }

    jest.clearAllMocks()
  })

  afterEach(clearAllSimpluxMocks)

  beforeEach(() => {
    moduleState = 20
  })

  it('call the original selector', () => {
    const { plus, plus2, minusOne } = createSelectors(moduleMock, {
      plus: (c, amount: number) => c + amount,
      plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
      minusOne: (c) => c - 1,
    })

    expect(plus(5)).toBe(25)
    expect(plus2(5, 7)).toBe(32)
    expect(minusOne()).toBe(19)

    expect(getModuleStateMock).toHaveBeenCalled()
  })

  it('can be mocked', () => {
    const { plus, plus2, minusOne } = createSelectors(moduleMock, {
      plus: (c, amount: number) => c + amount,
      plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
      minusOne: (c) => c - 1,
    })

    const [plusSpy] = mockSelector(plus, jest.fn().mockReturnValue(-1))

    const [plus2Spy] = mockSelector(plus2, jest.fn().mockReturnValue(-2))

    const [minusOneSpy] = mockSelector(minusOne, jest.fn().mockReturnValue(-3))

    const plusReturnValue = plus(5)
    expect(plusSpy).toHaveBeenCalledWith(5)
    expect(plusReturnValue).toBe(-1)

    const plus2ReturnValue = plus2(5, 7)
    expect(plus2Spy).toHaveBeenCalledWith(5, 7)
    expect(plus2ReturnValue).toBe(-2)

    const minusOneReturnValue = minusOne()
    expect(minusOneSpy).toHaveBeenCalled()
    expect(minusOneReturnValue).toBe(-3)
  })

  describe('mocks', () => {
    it('can be cleared', () => {
      const { plus } = createSelectors(moduleMock, {
        plus: (c, amount: number) => c + amount,
      })

      const [spy, clear] = mockSelector(plus, jest.fn())

      plus(5)

      clear()

      plus(10)

      expect(getModuleStateMock).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('can be removed all at once', () => {
      const { plus, plus2 } = createSelectors(moduleMock, {
        plus: (c, amount: number) => c + amount,
        plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
      })

      const [spy1] = mockSelector(plus, jest.fn())
      const [spy2] = mockSelector(plus2, jest.fn())

      plus(5)
      plus2(6, 7)

      clearAllSimpluxMocks()

      plus(10)
      plus2(11, 12)

      expect(getModuleStateMock).toHaveBeenCalledTimes(2)
      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
    })

    it('can be removed all at once for multiple modules', () => {
      const moduleMock2: typeof moduleMock = {
        state: getModuleStateMock as any,
        setState: setModuleStateMock,
        subscribeToStateChanges: subscribeToModuleStateChangesMock,
        $simplux: {
          name: 'test2',
          mutations: {},
          dispatch: dispatchMock,
          getReducer: undefined!,
          getState: getModuleStateMock,
        },
        [SIMPLUX_MODULE]: undefined!,
      }

      const { plusOne, plus } = createSelectors(moduleMock, {
        plusOne: (c) => c + 1,
        plus: (c, amount: number) => c + amount,
      })

      const { plusOne2, plus2 } = createSelectors(moduleMock2, {
        plusOne2: (c) => c + 1,
        plus2: (c, amount: number) => c + amount,
      })

      const [spy1] = mockSelector(plusOne, jest.fn())
      const [spy2] = mockSelector(plus, jest.fn())
      const [spy3] = mockSelector(plusOne2, jest.fn())
      const [spy4] = mockSelector(plus2, jest.fn())

      plusOne()
      plus(10)
      plusOne2()
      plus2(20)

      clearAllSimpluxMocks()

      plusOne()
      plus(5)
      plusOne2()
      plus2(15)

      expect(getModuleStateMock).toHaveBeenCalledTimes(4)

      expect(spy1).toHaveBeenCalledTimes(1)
      expect(spy2).toHaveBeenCalledTimes(1)
      expect(spy3).toHaveBeenCalledTimes(1)
      expect(spy4).toHaveBeenCalledTimes(1)
    })
  })
})

import { SimpluxModule, SIMPLUX_MODULE } from './module.js'
import { createSelectors, _isSimpluxSelector } from './selectors.js'

describe('selectors', () => {
  let nodeEnv: string | undefined
  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<typeof moduleState>

  beforeEach(() => {
    moduleState = 0
    moduleMock = {
      state: getModuleStateMock as any,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simplux: {
        name: 'test',
        mutations: {},
        dispatch: undefined!,
        getReducer: undefined!,
        getState: getModuleStateMock,
      },
      [SIMPLUX_MODULE]: '' as any,
    }

    jest.clearAllMocks()
    nodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv
  })

  describe(`factory`, () => {
    describe(`returned selectors`, () => {
      beforeEach(() => {
        moduleState = 20
      })

      it('are evaluated with the latest state of the module', () => {
        const { plus, plus2, minusOne } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
          minusOne: (c) => c - 1,
        })

        expect(plus(5)).toBe(25)
        expect(plus2(5, 7)).toBe(32)
        expect(minusOne()).toBe(19)
      })

      it('calls the mock if it is defined', () => {
        const { plus, plus2, minusOne } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
          minusOne: (c) => c - 1,
        })

        const plusMock = jest.fn().mockReturnValueOnce(-1)
        const plus2Mock = jest.fn().mockReturnValueOnce(-2)
        const minusOneMock = jest.fn().mockReturnValueOnce(-3)

        moduleMock.$simplux.selectorMocks = {
          [plus.selectorId]: plusMock,
          [plus2.selectorId]: plus2Mock,
          [minusOne.selectorId]: minusOneMock,
        }

        expect(plus(5)).toBe(-1)
        expect(plus2(5, 7)).toBe(-2)
        expect(minusOne()).toBe(-3)

        expect(plusMock).toHaveBeenCalledWith(5)
        expect(plus2Mock).toHaveBeenCalledWith(5, 7)
        expect(minusOneMock).toHaveBeenCalled()
        expect(getModuleStateMock).not.toHaveBeenCalled()
      })

      it('can be called with a specified state', () => {
        const { plus, plus2 } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
        })

        expect(plus.withState(10, 5)).toBe(15)
        expect(plus2.withState(10, 5, 7)).toBe(22)
      })

      it('does not call the mock if called with specified state', () => {
        const { plus } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
        })

        const plusMock = jest.fn().mockReturnValueOnce(-1)

        moduleMock.$simplux.selectorMocks = {
          [plus.selectorId]: plusMock,
        }

        expect(plus.withState(1, 5)).toBe(6)

        expect(plusMock).not.toHaveBeenCalled()
      })

      it('can be composed', () => {
        const { plusOne, plus } = createSelectors(moduleMock, {
          plusOne: (c) => c + 1,
          plus: (c, amount: number) => {
            for (let i = 0; i < amount; i += 1) {
              c = plusOne.withState(c)
            }

            return c
          },
        })

        const { plusTwo } = createSelectors(moduleMock, {
          plusTwo: (c) => plusOne.withState(plusOne.withState(c)),
        })

        expect(plusTwo()).toBe(22)
        expect(plus(5)).toBe(25)
      })

      it('has the same name as the selector', () => {
        const { plus } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
        })

        expect(plus.name).toBe('plus')
      })

      it('has the same selectorName as the selector', () => {
        const { plus } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
        })

        expect(plus.selectorName).toBe('plus')
      })

      it('has a reference to the owning module', () => {
        const { plus } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
        })

        expect(plus.owningModule).toBe(moduleMock)
      })

      it('is memoized without arguments', () => {
        const mock = jest.fn()

        const { value } = createSelectors(moduleMock, {
          value: (c) => mock(c)!,
        })

        value()

        expect(mock).toHaveBeenCalledTimes(1)

        value()

        expect(mock).toHaveBeenCalledTimes(1)

        moduleState = moduleState + 1

        value()

        expect(mock).toHaveBeenCalledTimes(2)

        value()

        expect(mock).toHaveBeenCalledTimes(2)
      })

      it('is memoized with arguments', () => {
        const mock = jest.fn()

        const { plus } = createSelectors(moduleMock, {
          plus: (c, amount: number) => mock(c, amount)!,
        })

        plus(5)

        expect(mock).toHaveBeenCalledTimes(1)

        plus(5)

        expect(mock).toHaveBeenCalledTimes(1)

        moduleState = moduleState + 1

        plus(5)

        expect(mock).toHaveBeenCalledTimes(2)

        plus(5)

        expect(mock).toHaveBeenCalledTimes(2)

        plus(10)

        expect(mock).toHaveBeenCalledTimes(3)

        plus(10)

        expect(mock).toHaveBeenCalledTimes(3)

        plus(5)

        expect(mock).toHaveBeenCalledTimes(4)
      })

      it('does not memoize on exceptions', () => {
        const { value } = createSelectors(moduleMock, {
          value: (_, n: number) => {
            if (n > 0) {
              throw new Error()
            }

            return n
          },
        })

        value(0)

        expect(() => value(1)).toThrow()
        expect(() => value(1)).toThrow()

        value.withState(0, 0)

        expect(() => value.withState(0, 1)).toThrow()
        expect(() => value.withState(0, 1)).toThrow()
      })
    })
  })

  describe(_isSimpluxSelector, () => {
    it('returns true for a simplux selector', () => {
      const { plusOne } = createSelectors(moduleMock, {
        plusOne: (c) => c + 1,
      })

      expect(_isSimpluxSelector(plusOne)).toBe(true)
    })

    it('returns false for a string value', () => {
      expect(_isSimpluxSelector('string')).toBe(false)
    })

    it('returns false for a number value', () => {
      expect(_isSimpluxSelector(10)).toBe(false)
    })

    it('returns false for an object value', () => {
      expect(_isSimpluxSelector({})).toBe(false)
    })

    it('returns false for an undefined value', () => {
      expect(_isSimpluxSelector(undefined)).toBe(false)
    })

    it('returns false for an null value', () => {
      expect(_isSimpluxSelector(null)).toBe(false)
    })
  })
})

import { SimpluxModule } from './module'
import { createSelectors } from './selectors'

describe('selectors', () => {
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
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      $simpluxInternals: {
        name: 'test',
        mockStateValue: undefined,
        mutations: {},
        mutationMocks: {},
        selectors: {},
        dispatch: undefined!,
        getReducer: undefined!,
      },
    }

    jest.clearAllMocks()
  })

  describe(`factory`, () => {
    it('throws when existing selector is declared again', () => {
      createSelectors(moduleMock, {
        plus: c => c + 1,
      })

      expect(() =>
        createSelectors(moduleMock, {
          plus: c => c + 2,
        }),
      ).toThrowError(`selector 'plus' is already defined for module 'test'`)
    })

    describe(`returned selectors`, () => {
      beforeEach(() => {
        moduleState = 20
      })

      it('are evaluated with the latest state of the module', () => {
        const { plus, plus2, minusOne } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
          minusOne: c => c - 1,
        })

        expect(plus(5)).toBe(25)
        expect(plus2(5, 7)).toBe(32)
        expect(minusOne()).toBe(19)
      })

      it('can be called with a specified state', () => {
        const { plus, plus2 } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
        })

        expect(plus.withState(10, 5)).toBe(15)
        expect(plus2.withState(10, 5, 7)).toBe(22)
      })

      it('can be composed', () => {
        const { plusOne, plus } = createSelectors(moduleMock, {
          plusOne: c => c + 1,
          plus: (c, amount: number) => {
            for (let i = 0; i < amount; i += 1) {
              c = plusOne.withState(c)
            }

            return c
          },
        })

        const { plusTwo } = createSelectors(moduleMock, {
          plusTwo: c => plusOne.withState(plusOne.withState(c)),
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
          value: c => mock(c)!,
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
    })
  })
})

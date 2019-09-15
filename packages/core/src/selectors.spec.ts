import { SimpluxModule, SimpluxModuleInternals } from './module'
import { createSelectors } from './selectors'

describe('selectors', () => {
  let moduleState = 0
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)
  let moduleExtensionStateContainer = {} as any

  let moduleMock: SimpluxModule<typeof moduleState> & SimpluxModuleInternals

  beforeEach(() => {
    moduleState = 0
    moduleExtensionStateContainer = {} as any
    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      name: 'test',
      extensionStateContainer: moduleExtensionStateContainer,
      dispatch: undefined!,
      getReducer: undefined!,
    }

    jest.clearAllMocks()
  })

  describe(`factory`, () => {
    it('adds the selectors state container', () => {
      createSelectors(moduleMock, {})

      expect(moduleExtensionStateContainer.selectors.test).toEqual({})
    })

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

      it('selects the state', () => {
        const { plus, plus2, minusOne } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
          minusOne: c => c - 1,
        })

        expect(plus(10, 5)).toBe(15)
        expect(plus2(10, 5, 7)).toBe(22)
        expect(minusOne(10)).toBe(9)
      })

      it('can be called with bound state', () => {
        const { plus, plus2 } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
        })

        expect(plus.withLatestModuleState(5)).toBe(25)
        expect(plus2.withLatestModuleState(5, 7)).toBe(32)
      })

      it('can be called as a factory', () => {
        const { plus, plus2 } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
          plus2: (c, arg1: number, arg2: number) => c + arg1 + arg2,
        })

        expect(plus.asFactory(5)).toBeInstanceOf(Function)
        expect(plus.asFactory(5)(20)).toBe(25)

        expect(plus2.asFactory(5, 7)).toBeInstanceOf(Function)
        expect(plus2.asFactory(5, 7)(20)).toBe(32)
      })

      it('can be composed', () => {
        const { plusOne, plus } = createSelectors(moduleMock, {
          plusOne: c => c + 1,
          plus: (c, amount: number) => {
            for (let i = 0; i < amount; i += 1) {
              c = plusOne(c)
            }

            return c
          },
        })

        const { plusTwo } = createSelectors(moduleMock, {
          plusTwo: c => plusOne(plusOne(c)),
        })

        expect(plusTwo(10)).toBe(12)
        expect(plus(10, 5)).toBe(15)
      })

      it('has the same name as the selector', () => {
        const { plus } = createSelectors(moduleMock, {
          plus: (c, amount: number) => c + amount,
        })

        expect(plus.name).toBe('plus')
      })
    })
  })
})
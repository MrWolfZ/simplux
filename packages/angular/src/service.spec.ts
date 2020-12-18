import {
  MutationDefinitions,
  SelectorDefinitions,
  SimpluxModule,
  SimpluxMutations,
  SimpluxSelectors,
  StateChangeSubscription,
} from '@simplux/core'
import { Observable } from 'rxjs'
import { createModuleServiceBaseClass } from './service'

type Mutable<T> = { -readonly [prop in keyof T]: T[prop] }
const asMutable = <T>(t: T): Mutable<T> => t

describe('service', () => {
  describe('class factory function', () => {
    const onError = (err: any) => console.error(err)

    interface State {
      count: number
      metadata: string
    }

    let moduleState: State = { count: 0, metadata: '' }
    const subscribers: ((state: State) => void)[] = []
    const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    const setModuleStateMock = jest.fn()

    let subscriptionMock: StateChangeSubscription<any, any>
    let subscribeToModuleStateChangesMock: jest.Mock

    let moduleMock: SimpluxModule<State>

    interface Mutations extends MutationDefinitions<State> {
      increment: (state: State) => State
      incrementBy: (state: State, amount: number) => State
    }

    let mutations: SimpluxMutations<State, Mutations>

    interface Selectors extends SelectorDefinitions<State> {
      selectCountPlusOne: (state: State) => number
      selectCountPlus: (state: State, amount: number) => number
    }

    let selectors: SimpluxSelectors<State, Selectors>

    beforeEach(() => {
      moduleState = { count: 10, metadata: '' }
      subscriptionMock = {
        unsubscribe: jest.fn(),
        handler: () => void 0,
      }
      subscribeToModuleStateChangesMock = jest.fn().mockImplementation((s) => {
        subscribers.push(s)
        s(moduleState)
        return subscriptionMock
      })

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

      mutations = {
        increment: (() => moduleState) as any,
        incrementBy: ((amount: number) => ({
          count: moduleState.count + amount,
        })) as any,
      }

      selectors = {
        selectCountPlusOne: (() => moduleState.count + 1) as any,
        selectCountPlus: ((amount: number) =>
          moduleState.count + amount) as any,
      }

      asMutable(selectors.selectCountPlusOne).withState = (state: State) =>
        state.count + 1

      asMutable(selectors.selectCountPlus).withState = (
        state: State,
        amount: number,
      ) => state.count + amount

      jest.clearAllMocks()
    })

    it('creates a class', () => {
      // tslint:disable-next-line: no-inferred-empty-object-type
      const MockModuleServiceBase = createModuleServiceBaseClass(
        moduleMock,
        mutations,
        selectors,
      )

      class MockModuleService extends MockModuleServiceBase {}
      const service: MockModuleService = new MockModuleService()
      expect(service).toBeDefined()
      expect(service instanceof MockModuleService).toBe(true)
    })

    it('can create a class with multiple sets of mutations', () => {
      interface Mutations2 extends MutationDefinitions<State> {
        decrement: (state: State) => State
      }

      const mutations2: SimpluxMutations<State, Mutations2> = {
        decrement: (() => moduleState) as any,
      }

      // tslint:disable-next-line: no-inferred-empty-object-type
      const MockModuleServiceBase = createModuleServiceBaseClass(
        moduleMock,
        {
          ...mutations,
          ...mutations2,
        },
        selectors,
      )

      class MockModuleService extends MockModuleServiceBase {}
      const service = new MockModuleService()
      expect(service.increment).toBeDefined()
      expect(service.decrement).toBeDefined()
    })

    it('can create a class with multiple sets of selectors', () => {
      interface Selectors2 extends SelectorDefinitions<State> {
        selectCountMinusOne: (state: State) => number
      }

      const selectors2: SimpluxSelectors<State, Selectors2> = {
        selectCountMinusOne: (() => moduleState.count - 1) as any,
      }

      // tslint:disable-next-line: no-inferred-empty-object-type
      const MockModuleServiceBase = createModuleServiceBaseClass(
        moduleMock,
        mutations,
        {
          ...selectors,
          ...selectors2,
        },
      )

      class MockModuleService extends MockModuleServiceBase {}
      const service = new MockModuleService()
      expect(service.selectCountPlusOne).toBeDefined()
      expect(service.selectCountMinusOne).toBeDefined()
    })

    describe('created class', () => {
      const createService = () => {
        // tslint:disable-next-line: no-inferred-empty-object-type
        const ServiceBase = createModuleServiceBaseClass(
          moduleMock,
          mutations,
          selectors,
        )
        class Service extends ServiceBase {}
        return new Service()
      }

      it('can get the state', () => {
        const service = createService()

        expect(service.getCurrentState()).toEqual(moduleState)
      })

      it('can observe the state', () => {
        const service = createService()

        const subscriber = jest.fn()
        service.selectState().subscribe(subscriber, onError)

        const updatedState: State = { ...moduleState, count: 20 }

        subscribers.forEach((s) => s(updatedState))

        expect(service.selectState()).toBeInstanceOf(Observable)
        expect(subscriber).toHaveBeenCalledTimes(2)
        expect(subscriber).toHaveBeenCalledWith(moduleState)
        expect(subscriber).toHaveBeenCalledWith(updatedState)
      })

      it('can stop observing the state', () => {
        const service = createService()

        const subscriber = jest.fn()
        const sub = service.selectState().subscribe(subscriber, onError)

        let updatedState: State = { ...moduleState, count: 20 }
        subscribers.forEach((s) => s(updatedState))

        expect(subscriber).toHaveBeenCalledTimes(2)

        sub.unsubscribe()

        updatedState = { ...updatedState, count: 30 }
        subscribers.forEach((s) => s(updatedState))

        expect(subscriber).toHaveBeenCalledTimes(2)
      })

      it('has a method for each mutation', () => {
        const service = createService()

        expect(service.increment).toBeDefined()
        expect(service.incrementBy).toBeDefined()
      })

      it('unsubscribes from store when not observing anymore', () => {
        const service = createService()

        const subscriber = jest.fn()
        const sub = service.selectState().subscribe(subscriber, onError)
        sub.unsubscribe()

        expect(subscriptionMock.unsubscribe).toHaveBeenCalled()
      })

      describe('mutations', () => {
        it('execute the mutation when called', () => {
          const service = createService()

          expect(service.increment()).toEqual(moduleState)
          expect(service.incrementBy(5)).toEqual({
            count: moduleState.count + 5,
          })
        })
      })

      it('has a method for each selector', () => {
        const service = createService()

        expect(service.selectCountPlusOne).toBeDefined()
        expect(service.selectCountPlus).toBeDefined()
      })

      describe('selectors', () => {
        it('return an observable', () => {
          const service = createService()

          expect(service.selectCountPlusOne()).toBeInstanceOf(Observable)
          expect(service.selectCountPlus(5)).toBeInstanceOf(Observable)
        })

        describe('returned observable', () => {
          it('emits the selector result on the current state when subscribed', () => {
            const service = createService()

            const subscriber1 = jest.fn()
            const subscriber2 = jest.fn()

            service.selectCountPlusOne().subscribe(subscriber1, onError)
            service.selectCountPlus(5).subscribe(subscriber2, onError)

            expect(subscriber1).toHaveBeenCalledWith(moduleState.count + 1)
            expect(subscriber2).toHaveBeenCalledWith(moduleState.count + 5)
          })

          it('emits a new value with the result when the state changes', () => {
            const service = createService()

            const subscriber1 = jest.fn()
            const subscriber2 = jest.fn()

            service.selectCountPlusOne().subscribe(subscriber1, onError)
            service.selectCountPlus(5).subscribe(subscriber2, onError)

            const updatedState: State = { ...moduleState, count: 20 }

            subscribers.forEach((s) => s(updatedState))

            expect(subscriber1).toHaveBeenCalledWith(updatedState.count + 1)
            expect(subscriber2).toHaveBeenCalledWith(updatedState.count + 5)
          })

          it('does not emit a value if the result of the selector does not change', async () => {
            const service = createService()

            const subscriber1 = jest.fn()
            const subscriber2 = jest.fn()

            service.selectCountPlusOne().subscribe(subscriber1, onError)
            service.selectCountPlus(5).subscribe(subscriber2, onError)

            const updatedState: State = { ...moduleState, metadata: 'updated' }

            subscribers.forEach((s) => s(updatedState))

            expect(subscriber1).toHaveBeenCalledTimes(1)
            expect(subscriber2).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})

import { ResolvedMutations, SimpluxModule, Subscription } from '@simplux/core'
import { ResolvedSelectors } from '@simplux/selectors'
import { Observable } from 'rxjs'
import { createModuleServiceBaseClass } from './service'

describe('service', () => {
  describe('class factory function', () => {
    interface State {
      count: number
      metadata: string
    }

    let moduleState: State = { count: 0, metadata: '' }
    const subscribers: ((state: State) => void)[] = []
    const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
    const setModuleStateMock = jest.fn()

    let subscriptionMock: Subscription<any, any>
    let subscribeToModuleStateChangesMock: jest.Mock

    let moduleMock: SimpluxModule<State>
    let mutations: ResolvedMutations<
      State,
      {
        increment: (state: State) => State;
        incrementBy: (state: State, amount: number) => State;
      }
    >

    let selectors: ResolvedSelectors<
      State,
      {
        selectCountPlusOne: (state: State) => number;
        selectCountPlus: (state: State, amount: number) => number;
      }
    >

    beforeEach(() => {
      moduleState = { count: 10, metadata: '' }
      subscriptionMock = {
        unsubscribe: jest.fn(),
        handler: () => void 0,
      }
      subscribeToModuleStateChangesMock = jest.fn().mockImplementation(s => {
        subscribers.push(s)
        s(moduleState)
        return subscriptionMock
      })

      moduleMock = {
        getState: getModuleStateMock,
        setState: setModuleStateMock,
        subscribeToStateChanges: subscribeToModuleStateChangesMock,
        name: 'test',
      }

      mutations = {
        increment: (() => moduleState) as any,
        incrementBy: ((amount: number) => ({
          count: moduleState.count + amount,
        })) as any,
      }

      selectors = {
        selectCountPlusOne: ((state: State) => state.count + 1) as any,
        selectCountPlus: ((state: State, amount: number) =>
          state.count + amount) as any,
      }

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
      const mutations2: ResolvedMutations<
        State,
        {
          decrement: (state: State) => State;
        }
      > = {
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
      const selectors2: ResolvedSelectors<
        State,
        {
          selectCountMinusOne: (state: State) => number;
        }
      > = {
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
        service.selectState().subscribe(subscriber)

        const updatedState: State = { ...moduleState, count: 20 }

        subscribers.forEach(s => s(updatedState))

        expect(service.selectState()).toBeInstanceOf(Observable)
        expect(subscriber).toHaveBeenCalledTimes(2)
        expect(subscriber).toHaveBeenCalledWith(moduleState)
        expect(subscriber).toHaveBeenCalledWith(updatedState)
      })

      it('has a method for each mutation', () => {
        const service = createService()

        expect(service.increment).toBeDefined()
        expect(service.incrementBy).toBeDefined()
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

            service.selectCountPlusOne().subscribe(subscriber1)
            service.selectCountPlus(5).subscribe(subscriber2)

            expect(subscriber1).toHaveBeenCalledWith(moduleState.count + 1)
            expect(subscriber2).toHaveBeenCalledWith(moduleState.count + 5)
          })

          it('emits a new value with the result when the state changes', () => {
            const service = createService()

            const subscriber1 = jest.fn()
            const subscriber2 = jest.fn()

            service.selectCountPlusOne().subscribe(subscriber1)
            service.selectCountPlus(5).subscribe(subscriber2)

            const updatedState: State = { ...moduleState, count: 20 }

            subscribers.forEach(s => s(updatedState))

            expect(subscriber1).toHaveBeenCalledWith(updatedState.count + 1)
            expect(subscriber2).toHaveBeenCalledWith(updatedState.count + 5)
          })

          it('does not emit a value if the result of the selector does not change', async () => {
            const service = createService()

            const subscriber1 = jest.fn()
            const subscriber2 = jest.fn()

            service.selectCountPlusOne().subscribe(subscriber1)
            service.selectCountPlus(5).subscribe(subscriber2)

            const updatedState: State = { ...moduleState, metadata: 'updated' }

            subscribers.forEach(s => s(updatedState))

            expect(subscriber1).toHaveBeenCalledTimes(1)
            expect(subscriber2).toHaveBeenCalledTimes(1)
          })
        })
      })
    })
  })
})

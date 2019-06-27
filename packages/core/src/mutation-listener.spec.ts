import { SimpluxModule, SimpluxModuleInternals } from './module'
import {
  listenToMutation,
  MutationListenerSubscription,
} from './mutation-listener'
import { ResolvedMutationInternals } from './mutations'

describe('mutation listener', () => {
  const dispatchMock = jest.fn().mockImplementation(a => a)
  const getReducerMock = jest.fn()

  let moduleState = { value: 0 }
  const getModuleStateMock = jest.fn().mockImplementation(() => moduleState)
  const setModuleStateMock = jest.fn()
  const subscribeToModuleStateChangesMock = jest
    .fn()
    .mockImplementation(() => () => void 0)

  let moduleMock: SimpluxModule<typeof moduleState> & SimpluxModuleInternals
  let mutationMock: ((arg1: string, arg2: { nestedArg: boolean }) => void) & {
    type: string;
  } & ResolvedMutationInternals<typeof moduleState>
  let subscription: MutationListenerSubscription<typeof moduleState, any>
  let listenerSpy: jest.Mock

  beforeEach(() => {
    moduleState = { value: 0 }
    moduleMock = {
      getState: getModuleStateMock,
      setState: setModuleStateMock,
      subscribeToStateChanges: subscribeToModuleStateChangesMock,
      name: 'test',
      extensionStateContainer: { mutationListeners: {} },
      dispatch: dispatchMock,
      getReducer: getReducerMock,
    }

    mutationMock = (() => {}) as any
    mutationMock.type = '@simplux/counter/mutation/increment'
    mutationMock.mutationName = 'increment'
    mutationMock.owningModule = { name: 'counter' } as any
    listenerSpy = jest.fn()
    subscription = listenToMutation(moduleMock, mutationMock, listenerSpy)

    jest.clearAllMocks()
  })

  afterEach(() => {
    subscription.stopListening()
  })

  it('throws when listening to mutation of same module', () => {
    mutationMock.type = '@simplux/test/mutation/testMutation'
    mutationMock.mutationName = 'testMutation'
    mutationMock.owningModule = moduleMock
    expect(() =>
      listenToMutation(moduleMock, mutationMock, listenerSpy),
    ).toThrowError(
      // tslint:disable-next-line: max-line-length
      `you cannot listen to mutation 'testMutation' of module 'test' since it belongs to the same module`,
    )
  })

  it('throws when listening to same mutation twice', () => {
    expect(() =>
      listenToMutation(moduleMock, mutationMock, listenerSpy),
    ).toThrowError(
      // tslint:disable-next-line: max-line-length
      `mutation listener for mutation 'increment' of module 'counter' is already defined for module 'test'`,
    )
  })

  it('adds the listener', () => {
    const listeners = moduleMock.extensionStateContainer
      .mutationListeners as any
    expect(listeners[mutationMock.type]).toBe(listenerSpy)
  })

  it('removes the listener when stopping listening', () => {
    subscription.stopListening()

    const listeners = moduleMock.extensionStateContainer
      .mutationListeners as any
    expect(listeners[mutationMock.type]).toBeUndefined()
  })

  it('returns a subscription with the listener', () => {
    subscription.stopListening()

    let args: any[] = []
    const { listener } = listenToMutation(
      moduleMock,
      mutationMock,
      (state, arg1, arg2) => {
        args = [{ ...state }, arg1, arg2]
      },
    )

    listener(moduleState, '', { nestedArg: true })
    expect(args).toEqual([moduleState, '', { nestedArg: true }])
  })

  describe('returned listener', () => {
    beforeEach(() => {
      subscription.stopListening()
    })

    it('performs immutable update', () => {
      const { listener } = listenToMutation(moduleMock, mutationMock, state => {
        state.value += 1
      })

      const result = listener(moduleState, '', { nestedArg: true })

      expect(result.value).toBe(1)
      expect(moduleState.value).toBe(0)
    })

    it('returns the correct value', () => {
      const { listener } = listenToMutation(moduleMock, mutationMock, () => {
        return {
          value: 10,
        }
      })

      const result = listener(moduleState, '', { nestedArg: true })

      expect(result.value).toBe(10)
    })
  })
})

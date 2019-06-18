import {
  ResolvedMutationInternals,
  SimpluxModule,
  SimpluxModuleInternals,
} from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup'

export function setupMutationMock<
  TState,
  TArgs extends any[],
  TMock extends (...args: TArgs) => TState
>(
  owningModule: SimpluxModule<TState>,
  mutationName: string,
  mockFn: TMock,
  nrOfCalls?: number,
) {
  const {
    extensionStateContainer,
  } = (owningModule as unknown) as SimpluxModuleInternals

  const moduleMutationMocks = extensionStateContainer.mutationMocks as {
    [mutationName: string]: (...args: TArgs) => TState;
  }

  let nrOfRemainingCalls = nrOfCalls

  const clearCleanup = registerMockCleanupFunction(cleanup)

  const mock = (...args: TArgs) => {
    const result = mockFn(...args)

    if (typeof nrOfRemainingCalls === 'number') {
      nrOfRemainingCalls -= 1

      if (nrOfRemainingCalls === 0) {
        cleanup()
      }
    }

    return result
  }

  moduleMutationMocks[mutationName] = mock

  return cleanup

  function cleanup() {
    delete moduleMutationMocks[mutationName]
    clearCleanup()
  }
}

/**
 * Specify a mock function that should be called instead of the
 * mutation. Takes an optional third parameter that specifies for how
 * many invocations of the mutation the mock should be used before it
 * is removed. By default the mutation will stay mocked indefinitely
 * or until the clear callback/`clearAllSimpluxMocks` is called.
 *
 * @param mutation the mutation to mock
 * @param mockFn the mock function to use
 * @param nrOfCalls the nr of times the mutation should be mocked
 * before the mock is automatically removed
 *
 * @returns a function that clears the mock when called
 */
export function mockMutation<
  TState,
  TArgs extends any[],
  TMock extends (...args: TArgs) => TState
>(mutation: (...args: TArgs) => TState, mockFn: TMock, nrOfCalls?: number) {
  const {
    owningModule,
    mutationName,
  } = (mutation as unknown) as ResolvedMutationInternals<TState>

  return setupMutationMock<TState, TArgs, TMock>(
    owningModule,
    mutationName,
    mockFn,
    nrOfCalls,
  )
}

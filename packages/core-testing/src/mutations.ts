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
>(owningModule: SimpluxModule<TState>, mutationName: string, mockFn: TMock) {
  const {
    extensionStateContainer,
  } = (owningModule as unknown) as SimpluxModuleInternals

  const moduleMutationMocks = extensionStateContainer.mutationMocks as {
    [mutationName: string]: (...args: TArgs) => TState;
  }

  const cleanup = () => {
    delete moduleMutationMocks[mutationName]
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  moduleMutationMocks[mutationName] = mockFn

  return cleanup
}

/**
 * Specify a mock function that should be called instead of the
 * mutation.The mutation will stay mocked indefinitely until either
 * the clear callback or `clearAllSimpluxMocks` is called.
 *
 * @param mutation the mutation to mock
 * @param mockFn the mock function to use
 *
 * @returns a function that clears the mock when called
 */
export function mockMutation<
  TState,
  TArgs extends any[],
  TMock extends (...args: TArgs) => TState
>(mutation: (...args: TArgs) => TState, mockFn: TMock) {
  const {
    owningModule,
    mutationName,
  } = (mutation as unknown) as ResolvedMutationInternals<TState>

  return setupMutationMock<TState, TArgs, TMock>(
    owningModule,
    mutationName,
    mockFn,
  )
}

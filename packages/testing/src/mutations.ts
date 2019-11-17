import { SimpluxModule, SimpluxMutation } from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup'

function setupMutationMock<
  TState,
  TArgs extends any[],
  TMock extends (...args: TArgs) => TState
>(owningModule: SimpluxModule<TState>, mutationName: string, mockFn: TMock) {
  const cleanup = () => {
    delete owningModule.$simpluxInternals.mutationMocks[mutationName]
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  owningModule.$simpluxInternals.mutationMocks[mutationName] = mockFn as any

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
>(mutation: SimpluxMutation<TState, TArgs>, mockFn: TMock) {
  return setupMutationMock<TState, TArgs, TMock>(
    mutation.owningModule,
    mutation.mutationName,
    mockFn,
  )
}

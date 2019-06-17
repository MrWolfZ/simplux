import {
  ResolvedMutationInternals,
  SimpluxModule,
  SimpluxModuleInternals,
} from '@simplux/core'

const mockCleanupFunctions: { [mutationName: string]: () => void } = {}

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

  const cleanup = () => {
    delete moduleMutationMocks[mutationName]
    delete mockCleanupFunctions[mutationName]
  }

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
  mockCleanupFunctions[mutationName] = cleanup
}

/**
 * Specify a mock function that should be called instead of the
 * mutation. Takes an optional second parameter that specifies for how
 * many invocations of the mutation the mock should be used before it
 * is removed. By default the mutation will stay mocked indefinitely
 * or until `removeMutationMock`/`removeAllMutationMocks` is called.
 *
 * @param mutation the mutation to mock
 * @param mockFn the mock function to use
 * @param nrOfCalls the nr of times the mutation should be mocked
 * before the mock is automatically removed
 *
 * @returns the mock function
 */
export function mockMutation<
  TState,
  TArgs extends any[],
  TMock extends (...args: TArgs) => TState
>(
  mutation: (...args: TArgs) => TState,
  mockFn: TMock,
  nrOfCalls?: number,
): TMock {
  const {
    owningModule,
    mutationName,
  } = (mutation as unknown) as ResolvedMutationInternals<TState>

  setupMutationMock<TState, TArgs, TMock>(
    owningModule,
    mutationName,
    mockFn,
    nrOfCalls,
  )

  return mockFn
}

/**
 * Specify a mock function that should be called instead of the
 * mutation for the next invocation of the mutation. Afterwards the
 * mock is automatically removed.
 *
 * @param mutation the mutation to mock
 * @param mockFn the mock function to use
 *
 * @returns the mock function
 */
export function mockMutationOnce<
  TState,
  TArgs extends any[],
  TMock extends (...args: TArgs) => TState
>(mutation: (...args: TArgs) => TState, mockFn: TMock): TMock {
  return mockMutation(mutation, mockFn, 1)
}

/**
 * Remove any mock that may currently be set for the mutation. Does
 * nothing if no mock is set.
 *
 * @param mutation the mutation to remove the mock for
 */
export function removeMutationMock<TState, TArgs extends any[]>(
  mutation: (...args: TArgs) => TState,
): void {
  const {
    owningModule,
    mutationName,
  } = (mutation as unknown) as ResolvedMutationInternals<TState>

  const {
    extensionStateContainer,
  } = (owningModule as unknown) as SimpluxModuleInternals

  const moduleMutationMocks = extensionStateContainer.mutationMocks as {
    [mutationName: string]: (...args: TArgs) => TState;
  }

  delete moduleMutationMocks[mutationName]
}

/**
 * Remove all mocks that are currently set for any mutation.
 */
export function removeAllMutationMocks(): void {
  Object.keys(mockCleanupFunctions).forEach(key => mockCleanupFunctions[key]())
}

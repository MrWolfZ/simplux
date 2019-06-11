import {
  MutationsFactory,
  SimpluxModuleExtension,
  SimpluxModuleMutationExtensions,
} from '@simplux/core'

export interface MutationsMocks {
  [type: string]: {
    mockFn: Function;
    remainingCallCount?: number;
  }
}

let mutationsMocks: MutationsMocks = {}

export function createMutationsFactoryWithTestingExtras<TState>(
  originalMutationFactory: MutationsFactory<TState>,
): MutationsFactory<TState> {
  return mutations => {
    const resolvedMutations = originalMutationFactory(mutations)

    for (const mutationName of Object.keys(mutations)) {
      const originalMutation = resolvedMutations[mutationName]

      const mutationInterceptor = (...args: any[]) => {
        const mock = mutationsMocks[originalMutation.type]

        if (mock) {
          const result = mock.mockFn(...args)

          if (typeof mock.remainingCallCount === 'number') {
            mock.remainingCallCount -= 1

            if (mock.remainingCallCount === 0) {
              delete mutationsMocks[originalMutation.type]
            }
          }

          return result
        }

        return originalMutation(...args)
      }

      resolvedMutations[
        mutationName as keyof typeof resolvedMutations
      ] = mutationInterceptor as typeof originalMutation

      for (const mutationExtra of Object.keys(originalMutation)) {
        resolvedMutations[mutationName][
          mutationExtra as keyof typeof originalMutation
        ] = originalMutation[mutationExtra as keyof typeof originalMutation]
      }
    }

    return resolvedMutations
  }
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
  mutation: ((...args: TArgs) => TState) & { type: string },
  mockFn: TMock,
  nrOfCalls?: number,
): TMock {
  mutationsMocks[mutation.type] = { mockFn, remainingCallCount: nrOfCalls }
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
>(
  mutation: ((...args: TArgs) => TState) & { type: string },
  mockFn: TMock,
): TMock {
  return mockMutation(mutation, mockFn, 1)
}

/**
 * Remove any mock that may currently be set for the mutation. Does
 * nothing if no mock is set.
 *
 * @param mutation the mutation to remove the mock for
 */
export function removeMutationMock<TState, TArgs extends any[]>(
  mutation: ((...args: TArgs) => TState) & { type: string },
): void {
  delete mutationsMocks[mutation.type]
}

/**
 * Remove all mocks that are currently set for any mutation.
 */
export function removeAllMutationMocks(): void {
  mutationsMocks = {}
}

export const mutationsTestingModuleExtension: SimpluxModuleExtension<
  SimpluxModuleMutationExtensions<any>
> = (_, _2, module: unknown) => {
  const mutationExtension = module as SimpluxModuleMutationExtensions<any>
  const originalMutationFactory = mutationExtension.createMutations

  return {
    createMutations: createMutationsFactoryWithTestingExtras(
      originalMutationFactory,
    ),
  }
}

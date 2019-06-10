import {
  MutationsFactory,
  SimpluxModuleExtension,
  SimpluxModuleMutationExtensions,
} from '@simplux/core'

export interface MutationsMocks {
  [name: string]: {
    mockFn: Function;
    remainingCallCount?: number;
  }
}

export function createMutationsFactoryWithTestingExtras<TState>(
  originalMutationFactory: MutationsFactory<TState>,
  mutationsMocks: MutationsMocks,
): MutationsFactory<TState> {
  return mutations => {
    const resolvedMutations = originalMutationFactory(mutations)

    for (const mutationName of Object.keys(mutations)) {
      const originalMutation = resolvedMutations[mutationName]

      const mutation = (...args: any[]) => {
        const mock = mutationsMocks[mutationName]
        if (mock) {
          const result = mutationsMocks[mutationName].mockFn(...args)

          if (typeof mock.remainingCallCount === 'number') {
            mock.remainingCallCount -= 1

            if (mock.remainingCallCount === 0) {
              delete mutationsMocks[mutationName]
            }
          }

          return result
        }

        return originalMutation(...args)
      }

      resolvedMutations[
        mutationName as keyof typeof resolvedMutations
      ] = mutation as typeof originalMutation

      for (const mutationExtra of Object.keys(originalMutation)) {
        resolvedMutations[mutationName][
          mutationExtra as keyof typeof originalMutation
        ] = originalMutation[mutationExtra as keyof typeof originalMutation]
      }

      resolvedMutations[mutationName].mock = (mockFn, nrOfCalls) => {
        mutationsMocks[mutationName] = { mockFn, remainingCallCount: nrOfCalls }
        return mockFn
      }

      resolvedMutations[mutationName].mockOnce = mockFn => {
        mutationsMocks[mutationName] = { mockFn, remainingCallCount: 1 }
        return mockFn
      }

      resolvedMutations[mutationName].removeMock = () => {
        delete mutationsMocks[mutationName]
      }
    }

    return resolvedMutations
  }
}

export interface ResolvedMutationTestingExtras<TState, TArgs extends any[]> {
  /**
   * Specify a mock function that should be called instead of the real
   * mutation. Takes an optional second parameter that specifies for how
   * many invocations of the mutation the mock should be used before it
   * is removed. By default the mutation will stay mocked indefinitely
   * or until `removeMock` is called.
   *
   * @param mock the mock function to use
   * @param mock the mock function to use
   *
   * @returns the mock function
   */
  mock<TMock extends (...args: TArgs) => TState>(
    mock: TMock,
    nrOfCalls?: number,
  ): TMock

  /**
   * Specify a mock function that should be called instead of the real
   * mutation for the next invocation of the mutation.
   *
   * @param mock the mock function to use
   *
   * @returns the mock function
   */
  mockOnce<TMock extends (...args: TArgs) => TState>(mock: TMock): TMock

  /**
   * Remove any mock that may currently be set. Does nothing if no mock
   * is set.
   */
  removeMock(): void
}

declare module '@simplux/core' {
  export interface ResolvedMutationExtras<TState, TArgs extends any[]>
    extends ResolvedMutationTestingExtras<TState, TArgs> {}
}

export const mutationsTestingModuleExtension: SimpluxModuleExtension<
  SimpluxModuleMutationExtensions<any>
> = ({ name }, _2, module: unknown, extensionState) => {
  extensionState.mutationsMocks = extensionState.mutationsMocks || {}
  extensionState.mutationsMocks[name] =
    extensionState.mutationsMocks[name] || {}

  const mutationExtension = module as SimpluxModuleMutationExtensions<any>
  const originalMutationFactory = mutationExtension.createMutations

  return {
    createMutations: createMutationsFactoryWithTestingExtras(
      originalMutationFactory,
      extensionState.mutationsMocks[name],
    ),
  }
}

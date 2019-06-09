import {
  MutationsFactory,
  SimpluxModuleExtension,
  SimpluxModuleMutationExtensions,
} from '@simplux/core'

export interface MutationsMocks {
  [name: string]: Function
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
        if (mutationsMocks[mutationName]) {
          return mutationsMocks[mutationName](...args)
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

      resolvedMutations[mutationName].setMock = mockFn => {
        mutationsMocks[mutationName] = mockFn
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
   * mutation.
   *
   * @param mock the mock function to use
   *
   * @returns the mock function
   */
  setMock<TMock extends (...args: TArgs) => TState>(mock: TMock): TMock

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

/**
 * This interface is used for mocking support during testing.
 *
 * @private
 */
export interface EffectMockDefinition {
  effectToMock: Function
  mockFn: Function
}

const mockDefinitions: EffectMockDefinition[] = []

/**
 * Create a new effect. An effect is any function that has side effects.
 * The main purpose of this function is to allow simple mocking of the
 * effect.
 *
 * @param effect the effect to create
 *
 * @returns a function that calls the provided effect and can be mocked
 */
export function createEffect<TEffect extends Function>(
  effect: TEffect,
): TEffect {
  const wrappedEffect: TEffect = ((...args: any[]) => {
    const mockDef = mockDefinitions.find(
      ({ effectToMock }) => effectToMock === wrappedEffect,
    )

    if (mockDef) {
      return mockDef.mockFn(...args)
    }

    return effect(...args)
  }) as any

  return wrappedEffect
}

/**
 * This interface is used for mocking support during testing.
 * It is part of the internal simplux API and should not be
 * used directly by application code.
 *
 * @private
 */
export function getMockDefinitionsInternal() {
  return mockDefinitions
}

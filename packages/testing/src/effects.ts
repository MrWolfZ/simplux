import { EffectMockDefinition, getMockDefinitionsInternal } from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup'

/**
 * Specify a mock function that should be called instead of the
 * effect. The effect will stay mocked indefinitely until either
 * the clear callback or `clearAllSimpluxMocks` is called.
 *
 * @param effect the effect to mock
 * @param mockFn the mock function to use
 *
 * @returns a function that clears the mock when called
 */
export function mockEffect<TEffect extends Function>(
  effectToMock: TEffect,
  mockFn: TEffect,
) {
  const mockDefinitions = getMockDefinitionsInternal()

  removeMock(mockDefinitions, effectToMock)

  mockDefinitions.push({
    effectToMock,
    mockFn,
  })

  const cleanup = () => {
    removeMock(mockDefinitions, effectToMock)
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  return cleanup
}

function removeMock<TEffect extends Function>(
  mockDefinitions: EffectMockDefinition[],
  effectToMock: TEffect,
) {
  const idx = mockDefinitions.findIndex(
    def => def.effectToMock === effectToMock,
  )

  if (idx >= 0) {
    mockDefinitions.splice(idx, 1)
  }
}

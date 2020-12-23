import {
  FunctionSignature,
  SimpluxEffect,
  _EffectMockDefinition,
  _getEffectMockDefinitionsInternal,
} from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup.js'

/**
 * Specify a mock function that should be called instead of the
 * effect. The effect will stay mocked indefinitely until either
 * the clear callback or `clearAllSimpluxMocks` is called.
 *
 * @param effect - the effect to mock
 * @param mockFn - the mock function to use
 *
 * @returns a function that clears the mock when called
 *
 * @public
 */
export function mockEffect<
  TEffect extends SimpluxEffect<(...args: any[]) => any>,
  TMock extends FunctionSignature<TEffect>
>(effectToMock: TEffect, mockFn: TMock): [TMock, () => void] {
  const mockDefinitions = _getEffectMockDefinitionsInternal()

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

  return [mockFn, cleanup]
}

function removeMock<
  TEffect extends SimpluxEffect<TEffectFunction>,
  TEffectFunction extends (...args: any[]) => any
>(mockDefinitions: _EffectMockDefinition[], effectToMock: TEffect) {
  const idx = mockDefinitions.findIndex(
    (def) => def.effectToMock === effectToMock,
  )

  if (idx >= 0) {
    mockDefinitions.splice(idx, 1)
  }
}

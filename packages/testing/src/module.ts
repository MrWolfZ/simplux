import type { SimpluxModule, SimpluxModuleMarker } from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup.js'

/**
 * Set a value that should be returned whenever the module's state
 * is accessed. This mocked state value does not affect the Redux
 * store and does not cause any state change susbcribers to be called
 * (the only exception being that new susbcribers that are created
 * while the mock state value is active will be called once with the
 * mocked state value immediately after subscribing).
 *
 * The mocked state value will stay active indefinitely until either
 * the clear callback or `clearAllSimpluxMocks` is called.
 *
 * @param simpluxModule - the module to mock the state for
 * @param mockStateValue - the mock state value to return when the
 * module's state is accessed
 *
 * @returns a function that clears the mock state when called
 *
 * @public
 */
export function mockModuleState<TState>(
  simpluxModule: SimpluxModuleMarker<TState>,
  mockStateValue: TState,
) {
  const module = simpluxModule as SimpluxModule<TState>
  module.$simpluxInternals.mockStateValue = mockStateValue

  const cleanup = () => {
    delete module.$simpluxInternals.mockStateValue
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  return cleanup
}

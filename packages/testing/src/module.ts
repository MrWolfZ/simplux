import { SimpluxModule } from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup'

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
 * @param simpluxModule the module to mock the state for
 * @param mockStateValue the mock state value to return when the
 * module's state is accessed
 *
 * @returns a function that clears the mock state when called
 */
export function mockModuleState<TState>(
  simpluxModule: SimpluxModule<TState>,
  mockStateValue: TState,
) {
  simpluxModule.$simpluxInternals.mockStateValue = mockStateValue

  const cleanup = () => {
    delete simpluxModule.$simpluxInternals.mockStateValue
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  return cleanup
}

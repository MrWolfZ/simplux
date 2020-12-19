const mockCleanupFunctions: (() => void)[] = []

/**
 * Register a function to be called when all mocks are cleared.
 *
 * @param cleanupFunction - the cleanup function to call
 *
 * @returns a function that can be called to unregister the function
 *
 * @public
 */
export function registerMockCleanupFunction(cleanupFunction: () => void) {
  function wrappedCleanupFunction() {
    cleanupFunction()
    unregisterCleanupFunction()
  }

  function unregisterCleanupFunction() {
    const idx = mockCleanupFunctions.indexOf(wrappedCleanupFunction)
    if (idx >= 0) {
      mockCleanupFunctions.splice(idx, 1)
    }
  }

  mockCleanupFunctions.push(wrappedCleanupFunction)

  return unregisterCleanupFunction
}

/**
 * Clear all mocks on any simplux functionality.
 *
 * @public
 */
export function clearAllSimpluxMocks() {
  // the map is required to make a copy of the source array
  // since we are modifying it when calling the cleanup functions
  mockCleanupFunctions.map((fn) => fn).forEach((fn) => fn())
}

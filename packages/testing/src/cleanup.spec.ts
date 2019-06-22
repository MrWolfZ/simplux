import { clearAllSimpluxMocks, registerMockCleanupFunction } from './cleanup'

describe('mock cleanup', () => {
  describe(registerMockCleanupFunction.name, () => {
    it('does not throw when cleanup function is unregistered twice', () => {
      const spy = jest.fn()

      const unregister = registerMockCleanupFunction(spy)

      unregister()

      expect(unregister).not.toThrow()
    })
  })

  describe(clearAllSimpluxMocks.name, () => {
    it('calls all cleanup functions', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      registerMockCleanupFunction(spy1)
      registerMockCleanupFunction(spy2)

      clearAllSimpluxMocks()

      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
    })

    it('does not call unregistered cleanup functions', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      registerMockCleanupFunction(spy1)
      const unregister = registerMockCleanupFunction(spy2)

      unregister()

      clearAllSimpluxMocks()

      expect(spy1).toHaveBeenCalled()
      expect(spy2).not.toHaveBeenCalled()
    })

    it('does not call cleanup functions twice', () => {
      const spy = jest.fn()

      registerMockCleanupFunction(spy)

      clearAllSimpluxMocks()
      clearAllSimpluxMocks()

      expect(spy).toHaveBeenCalledTimes(1)
    })
  })
})

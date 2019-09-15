import { createEffect, getMockDefinitionsInternal } from './effects'

describe(createEffect.name, () => {
  describe(`created effect`, () => {
    it('calls original effect when called', () => {
      const spy = jest.fn()
      const effect = createEffect(spy)
      effect()
      expect(spy).toHaveBeenCalled()
    })

    it('calls mock if it is defined', () => {
      const spy = jest.fn()
      const mockSpy = jest.fn()
      const effect = createEffect(spy)
      getMockDefinitionsInternal().push({
        effectToMock: effect,
        mockFn: mockSpy,
      })

      effect('foo', 1)
      expect(spy).not.toHaveBeenCalled()
      expect(mockSpy).toHaveBeenCalledWith('foo', 1)
      getMockDefinitionsInternal().splice(0, 1)
    })
  })
})

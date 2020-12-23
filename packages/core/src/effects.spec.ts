import {
  createEffect,
  createEffects,
  _getEffectMockDefinitionsInternal,
} from './effects'

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

      _getEffectMockDefinitionsInternal().push({
        effectToMock: effect,
        mockFn: mockSpy,
      })

      effect('foo', 1)

      expect(spy).not.toHaveBeenCalled()
      expect(mockSpy).toHaveBeenCalledWith('foo', 1)

      _getEffectMockDefinitionsInternal().splice(0, 1)
    })

    it('has name n/a', () => {
      const effect = createEffect(jest.fn())
      expect(effect.effectName).toBe('n/a')
    })
  })
})

describe(createEffects.name, () => {
  describe(`created effects`, () => {
    it('call original effect when called', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()

      const { effect1, effect2 } = createEffects({
        effect1: spy1,
        effect2: spy2,
      })

      effect1()
      effect2()

      expect(spy1).toHaveBeenCalled()
      expect(spy2).toHaveBeenCalled()
    })

    it('call mock if it is defined', () => {
      const spy1 = jest.fn()
      const spy2 = jest.fn()
      const mockSpy = jest.fn()

      const { effect1, effect2 } = createEffects({
        effect1: spy1,
        effect2: spy2,
      })

      _getEffectMockDefinitionsInternal().push({
        effectToMock: effect1,
        mockFn: mockSpy,
      })

      effect1('foo', 1)
      effect2()

      expect(spy1).not.toHaveBeenCalled()
      expect(mockSpy).toHaveBeenCalledWith('foo', 1)
      expect(spy2).toHaveBeenCalled()
      _getEffectMockDefinitionsInternal().splice(0, 1)
    })

    it('have correct name', () => {
      const { effect1, effect2 } = createEffects({
        effect1: jest.fn(),
        effect2: jest.fn(),
      })

      expect(effect1.effectName).toBe('effect1')
      expect(effect2.effectName).toBe('effect2')
    })
  })
})

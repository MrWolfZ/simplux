import {
  createEffect,
  createEffects,
  _getEffectMockDefinitionsInternal,
  _isSimpluxEffect,
} from './effects.js'

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

      expect(effect1.name).toBe('effect1')
      expect(effect1.effectName).toBe('effect1')
      expect(effect2.name).toBe('effect2')
      expect(effect2.effectName).toBe('effect2')
    })
  })

  describe(_isSimpluxEffect, () => {
    it('returns true for a simplux effect', () => {
      const { effect } = createEffects({
        effect: jest.fn(),
      })

      expect(_isSimpluxEffect(effect)).toBe(true)
    })

    it('returns false for a string value', () => {
      expect(_isSimpluxEffect('string')).toBe(false)
    })

    it('returns false for a number value', () => {
      expect(_isSimpluxEffect(10)).toBe(false)
    })

    it('returns false for an object value', () => {
      expect(_isSimpluxEffect({})).toBe(false)
    })

    it('returns false for an undefined value', () => {
      expect(_isSimpluxEffect(undefined)).toBe(false)
    })

    it('returns false for an null value', () => {
      expect(_isSimpluxEffect(null)).toBe(false)
    })
  })
})

import { createEffect } from '@simplux/core'
import { mockEffect } from './effects'

describe(mockEffect.name, () => {
  describe(`created effect`, () => {
    it('calls original effect when called', () => {
      const spy = jest.fn()
      const effect = createEffect(spy)
      effect()
      expect(spy).toHaveBeenCalled()
    })

    describe(`mock`, () => {
      it('is called if defined', () => {
        const spy = jest.fn()
        const mockSpy = jest.fn()
        const effect = createEffect(spy)
        mockEffect(effect, mockSpy)
        effect('foo', 1)
        expect(spy).not.toHaveBeenCalled()
        expect(mockSpy).toHaveBeenCalledWith('foo', 1)
      })

      it('can be removed', () => {
        const spy = jest.fn()
        const mockSpy = jest.fn()
        const effect = createEffect(spy)
        const clearMock = mockEffect(effect, mockSpy)
        effect()
        expect(spy).not.toHaveBeenCalled()
        expect(mockSpy).toHaveBeenCalled()
        clearMock()
        effect()
        expect(spy).toHaveBeenCalled()
        expect(mockSpy).toHaveBeenCalledTimes(1)
      })

      it('can safely be removed twice', () => {
        const spy = jest.fn()
        const mockSpy1 = jest.fn()
        const mockSpy2 = jest.fn()
        const effect1 = createEffect(spy)
        const effect2 = createEffect(spy)
        const clearMock = mockEffect(effect1, mockSpy1)
        mockEffect(effect2, mockSpy2)
        effect1()
        effect2()
        expect(mockSpy1).toHaveBeenCalledTimes(1)
        expect(mockSpy2).toHaveBeenCalledTimes(1)
        clearMock()
        clearMock()
        effect1()
        effect2()
        expect(mockSpy1).toHaveBeenCalledTimes(1)
        expect(mockSpy2).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe(`creating mocks`, () => {
    it('overwrites existing mock', () => {
      const spy = jest.fn()
      const mockSpy1 = jest.fn()
      const mockSpy2 = jest.fn()
      const effect = createEffect(spy)
      mockEffect(effect, mockSpy1)
      const clearMock = mockEffect(effect, mockSpy2)
      effect()
      expect(spy).not.toHaveBeenCalled()
      expect(mockSpy1).not.toHaveBeenCalled()
      expect(mockSpy2).toHaveBeenCalled()
      clearMock()
      effect()
      expect(spy).toHaveBeenCalled()
    })
  })
})

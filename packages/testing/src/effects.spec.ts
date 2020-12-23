import { createEffect } from '@simplux/core'
import { clearAllSimpluxMocks } from './cleanup.js'
import { mockEffect } from './effects.js'

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
        const effect = createEffect(spy)
        const [mockSpy] = mockEffect(effect, jest.fn())
        effect('foo', 1)
        expect(spy).not.toHaveBeenCalled()
        expect(mockSpy).toHaveBeenCalledWith('foo', 1)
      })

      it('can be removed', () => {
        const spy = jest.fn()
        const effect = createEffect(spy)
        const [mockSpy, clearMock] = mockEffect(effect, jest.fn())
        effect()
        expect(spy).not.toHaveBeenCalled()
        expect(mockSpy).toHaveBeenCalled()
        clearMock()
        effect()
        expect(spy).toHaveBeenCalled()
        expect(mockSpy).toHaveBeenCalledTimes(1)
      })

      it('can be removed all at once', () => {
        const spy = jest.fn()
        const effect1 = createEffect(spy)
        const effect2 = createEffect(spy)
        const [mockSpy1] = mockEffect(effect1, jest.fn())
        const [mockSpy2] = mockEffect(effect2, jest.fn())
        effect1()
        effect2()
        expect(mockSpy1).toHaveBeenCalledTimes(1)
        expect(mockSpy2).toHaveBeenCalledTimes(1)
        clearAllSimpluxMocks()
        effect1()
        effect2()
        expect(mockSpy1).toHaveBeenCalledTimes(1)
        expect(mockSpy2).toHaveBeenCalledTimes(1)
      })

      it('can safely be removed twice', () => {
        const spy = jest.fn()
        const effect1 = createEffect(spy)
        const effect2 = createEffect(spy)
        const [mockSpy1, clearMock] = mockEffect(effect1, jest.fn())
        const [mockSpy2] = mockEffect(effect2, jest.fn())
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

      it('returns a function of the correct type', () => {
        const effect = createEffect((c: number) => c)
        const [mockSpy] = mockEffect(effect, jest.fn())
        // tslint:disable-next-line: no-unbound-method
        expect(mockSpy.mockImplementation).toBeDefined()
      })
    })
  })

  describe(`creating mocks`, () => {
    it('overwrites existing mock', () => {
      const spy = jest.fn()
      const effect = createEffect(spy)
      const [mockSpy1] = mockEffect(effect, jest.fn())
      const [mockSpy2, clearMock] = mockEffect(effect, jest.fn())
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

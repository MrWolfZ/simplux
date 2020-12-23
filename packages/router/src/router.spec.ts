import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { _module } from './module.js'
import { createSimpluxRouter } from './router.js'

describe(`router`, () => {
  const routeName1 = 'testRoute1'
  const routeName2 = 'testRoute2'

  afterEach(clearAllSimpluxMocks)

  describe('created router', () => {
    const router = createSimpluxRouter()

    it('allows creating route without parameters', () => {
      const [registerMock] = mockEffect(_module.registerRoute, jest.fn())

      const testRoute = router.addRoute(routeName1)

      expect(testRoute.name).toBe(routeName1)
      expect(registerMock).toHaveBeenCalled()
    })

    it('allows creating route with parameters', () => {
      const [registerMock] = mockEffect(_module.registerRoute, jest.fn())

      const testRoute = router.addRoute(routeName2, {
        parameterDefaults: {
          stringParam: 'string',
          numberParam: 100,
          booleanParam: true,
        },
      })

      expect(testRoute.name).toBe(routeName2)
      expect(registerMock).toHaveBeenCalled()
    })

    it('allows creating multiple routes', () => {
      const [registerMock] = mockEffect(_module.registerRoute, jest.fn())

      router.addRoute(routeName1)

      router.addRoute(routeName2, {
        parameterDefaults: {
          stringParam: 'string',
          numberParam: 100,
          booleanParam: true,
        },
      })

      expect(registerMock).toHaveBeenCalledTimes(2)
    })
  })
})

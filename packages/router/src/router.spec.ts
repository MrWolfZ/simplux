import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { _module } from './module.js'
import { createSimpluxRouter } from './router.js'
import { routeName1, routeName2 } from './testdata.js'

describe(`router`, () => {
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

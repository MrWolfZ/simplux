import {
  clearAllSimpluxMocks,
  mockEffect,
  mockSelector,
} from '@simplux/testing'
import { _module } from './module.js'
import { _routeEffects } from './route.js'
import { _router } from './router.js'
import { routeName1, routeName2 } from './testdata.js'

describe(`router`, () => {
  afterEach(clearAllSimpluxMocks)

  describe('created router', () => {
    it('adds route without configuration', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeName1)

      expect(addMock).toHaveBeenCalledWith(routeName1)
    })

    it('adds route with configuration', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeName2, {})

      expect(addMock).toHaveBeenCalledWith(routeName2, {})
    })

    it('adds multiple routes', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeName1)

      _router.addRoute(routeName2, {})

      expect(addMock).toHaveBeenCalledWith(routeName1)
      expect(addMock).toHaveBeenCalledWith(routeName2, {})
    })

    it('delegations active route check to module', () => {
      const [mock] = mockSelector(_module.anyRouteIsActive, jest.fn())

      _router.anyRouteIsActive()

      expect(mock).toHaveBeenCalled()
    })

    it('delegations navigation to module', () => {
      const [navMock] = mockEffect(_module.navigateToRoute, jest.fn())

      _router.navigateToRouteById(1, { param: 'value' })

      expect(navMock).toHaveBeenCalledWith(1, { param: 'value' })
    })
  })
})

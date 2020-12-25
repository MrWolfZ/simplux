import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { _locationModule } from './location.js'
import { _module } from './module.js'
import { _routeEffects } from './route.js'
import { _router } from './router.js'
import {
  routeTemplateWithoutParameters,
  routeTemplateWithPathParameters,
} from './testdata.js'

describe(`router`, () => {
  afterEach(clearAllSimpluxMocks)

  describe('created router', () => {
    it('adds route without parameters', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeTemplateWithoutParameters)

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithoutParameters)
    })

    it('adds route with parameters', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeTemplateWithPathParameters)

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithPathParameters)
    })

    it('adds route with name', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeTemplateWithPathParameters, {
        name: 'customName',
      })

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithPathParameters, {
        name: 'customName',
      })
    })

    it('adds multiple routes', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeTemplateWithoutParameters)

      _router.addRoute(routeTemplateWithPathParameters, {
        name: 'customName',
      })

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithoutParameters)

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithPathParameters, {
        name: 'customName',
      })
    })

    it('delegates navigation to module', () => {
      const [navMock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())

      _router.navigateToUrl('/root/123')

      expect(navMock).toHaveBeenCalledWith('/root/123')
    })

    it('delegates activation to location module', () => {
      const [activationMock] = mockEffect(_locationModule.activate, jest.fn())

      _router.activate(window)

      expect(activationMock).toHaveBeenCalledWith(window)
    })
  })
})

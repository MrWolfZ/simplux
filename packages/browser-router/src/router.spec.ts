import {
  clearAllSimpluxMocks,
  mockEffect,
  mockSelector,
} from '@simplux/testing'
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

    it('adds multiple routes', () => {
      const [addMock] = mockEffect(_routeEffects.addRoute, jest.fn())

      _router.addRoute(routeTemplateWithoutParameters)

      _router.addRoute(routeTemplateWithPathParameters, {})

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithoutParameters)

      expect(addMock).toHaveBeenCalledWith(routeTemplateWithPathParameters, {})
    })

    it('delegates active route check to base router', () => {
      const [mock] = mockSelector(_router.anyRouteIsActive, jest.fn())

      _router.anyRouteIsActive()

      expect(mock).toHaveBeenCalled()
    })

    it('delegates nav in progress check to base router', () => {
      const [mock] = mockSelector(_router.navigationIsInProgress, jest.fn())

      _router.navigationIsInProgress()

      expect(mock).toHaveBeenCalled()
    })

    it('delegates current navigation URL check to module', () => {
      const [mock] = mockSelector(_module.currentNavigationUrl, jest.fn())

      _router.currentNavigationUrl()

      expect(mock).toHaveBeenCalled()
    })

    it('delegates navigation by URL to module', async () => {
      const [navMock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())
      navMock.mockResolvedValueOnce(void 0)

      await _router.navigateToUrl('/root/123')

      expect(navMock).toHaveBeenCalledWith('/root/123')
    })

    it('delegates activation to location module', () => {
      const [activationMock] = mockEffect(_locationModule.activate, jest.fn())

      _router.activate(window)

      expect(activationMock).toHaveBeenCalledWith(window)
    })
  })
})

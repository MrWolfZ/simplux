import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
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
  })
})

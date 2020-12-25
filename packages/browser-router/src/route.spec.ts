import { getSimpluxRouter, SimpluxRoute } from '@simplux/router'
import {
  clearAllSimpluxMocks,
  mockEffect,
  mockModuleState,
  mockMutation,
} from '@simplux/testing'
import { _module } from './module.js'
import { _routeEffects } from './route.js'
import {
  makeBrowserRouterState,
  rootRouteTemplate,
  routeTemplateWithoutParameters,
  routeTemplateWithPathParameters,
} from './testdata.js'

// tslint:disable:whitespace
// tslint:disable:semicolon

const addRoute = _routeEffects.addRoute
const router = getSimpluxRouter()

describe(`route`, () => {
  const isActiveMock = jest.fn()
  const parameterValuesMock = jest.fn()
  const navigateToMock = jest.fn()

  const mockRoute: SimpluxRoute = {
    id: 1,
    name: 'testRoute',
    isActive: isActiveMock as any,
    parameterValues: parameterValuesMock as any,
    navigateTo: navigateToMock as any,
  }

  const routerAddMock = jest.fn().mockReturnValue(mockRoute)
  const moduleAddMock = jest.fn()

  beforeEach(() => {
    clearAllSimpluxMocks()
    mockEffect(router.addRoute, routerAddMock)
    mockMutation(_module.addRoute, moduleAddMock)
    jest.clearAllMocks()
  })

  describe(addRoute, () => {
    it('creates a base route using the template as the name', () => {
      addRoute(rootRouteTemplate)

      expect(routerAddMock).toHaveBeenCalledWith(rootRouteTemplate, undefined)
    })

    it('adds the route to the module', () => {
      addRoute(routeTemplateWithPathParameters)

      expect(moduleAddMock).toHaveBeenCalledWith(
        1,
        routeTemplateWithPathParameters,
      )
    })

    it('creates a base route with a specific name', () => {
      addRoute(rootRouteTemplate, { name: 'testName' })

      expect(routerAddMock).toHaveBeenCalledWith('testName', {
        name: 'testName',
      })
    })

    describe('created route', () => {
      const mockRoute = addRoute('')

      describe(mockRoute.isActive, () => {
        it('delegates to the base route', () => {
          const testRoute = addRoute(routeTemplateWithPathParameters)

          testRoute.isActive()

          expect(isActiveMock).toHaveBeenCalled()
        })
      })

      describe(mockRoute.parameterValues, () => {
        it('delegates to the base route', () => {
          const testRoute = addRoute(routeTemplateWithPathParameters)

          testRoute.parameterValues()

          expect(parameterValuesMock).toHaveBeenCalled()
        })
      })

      describe(mockRoute.navigateTo, () => {
        it('delegates to the base route', () => {
          const testRoute = addRoute(routeTemplateWithoutParameters)

          testRoute.navigateTo()

          expect(navigateToMock).toHaveBeenCalled()
        })

        it('enforces correct parameters', () => {
          const testRoute = addRoute(routeTemplateWithPathParameters)

          const parameterValues: typeof testRoute.$parameterTypes = {
            stringParam: 'string',
            numberParam: 100,
            booleanParam: true,
          }

          testRoute.navigateTo(parameterValues)

          expect(navigateToMock).toHaveBeenCalledWith(parameterValues)
        })

        it('does not take parameters if route has none', () => {
          const testRoute = addRoute(routeTemplateWithoutParameters)

          testRoute.navigateTo()

          expect(navigateToMock).toHaveBeenCalled()
        })

        it('makes parameters optional if route has only optional parameters', () => {
          interface Parameters {
            opt?: string
          }

          const testRoute = addRoute<Parameters>(
            routeTemplateWithPathParameters,
          )

          testRoute.navigateTo()

          expect(navigateToMock).toHaveBeenCalledWith()
        })
      })

      describe(mockRoute.href, () => {
        it('delegates to module selector', () => {
          const path = 'root/:pathParam?queryParam'

          const state = makeBrowserRouterState({
            pathTemplateSegments: [
              'root',
              {
                parameterName: 'pathParam',
                parameterType: 'string',
              },
            ],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          })

          mockModuleState(_module, state)

          const parameterValues = {
            pathParam: 'pathValue',
            queryParam: 'queryValue',
          }

          const testRoute = addRoute(path)

          const href = testRoute.href(parameterValues)

          expect(href).toBe(
            `/${path
              .replace(':pathParam', parameterValues.pathParam)
              .replace(
                'queryParam',
                `queryParam=${parameterValues.queryParam}`,
              )}`,
          )
        })
      })
    })
  })
})

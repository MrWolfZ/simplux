import { getSimpluxRouter, SimpluxRoute, SIMPLUX_ROUTE } from '@simplux/router'
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

  const mockRoute: SimpluxRoute<{}> = {
    id: 1,
    name: 'testRoute',
    isActive: isActiveMock as any,
    parameterValues: parameterValuesMock as any,
    navigateTo: undefined!,
    onNavigateTo: undefined,
    [SIMPLUX_ROUTE]: undefined!,
  }

  const routerAddMock = jest
    .fn()
    .mockImplementation((_, config = {}) => ({ ...mockRoute, ...config }))

  const moduleAddMock = jest.fn()
  const moduleNavigateToIdMock = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    clearAllSimpluxMocks()
    mockEffect(router.addRoute, routerAddMock)
    mockMutation(_module.addRoute, moduleAddMock)
    mockEffect(_module.navigateToRouteById, moduleNavigateToIdMock)
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
        it('delegates to the module', async () => {
          const testRoute = addRoute(routeTemplateWithoutParameters)

          await testRoute.navigateTo()

          expect(moduleNavigateToIdMock).toHaveBeenCalled()
        })

        it('enforces correct parameters', async () => {
          const testRoute = addRoute(routeTemplateWithPathParameters)

          const parameterValues: typeof testRoute.$parameterTypes = {
            stringParam: 'string',
            numberParam: 100,
            booleanParam: true,
          }

          await testRoute.navigateTo(parameterValues)

          expect(moduleNavigateToIdMock).toHaveBeenCalledWith(
            1,
            parameterValues,
          )
        })

        it('does not take parameters if route has none', async () => {
          const testRoute = addRoute(routeTemplateWithoutParameters)

          await testRoute.navigateTo()

          expect(moduleNavigateToIdMock).toHaveBeenCalled()
        })

        it('makes parameters optional if route has only optional parameters', async () => {
          interface Parameters {
            opt?: string
          }

          const testRoute = addRoute<Parameters>(
            routeTemplateWithPathParameters,
          )

          await testRoute.navigateTo()

          expect(moduleNavigateToIdMock).toHaveBeenCalledWith(1, {})
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

      describe('onNavigateTo', () => {
        it('is the passed callback', () => {
          const onNavigateTo = jest.fn()
          const testRoute = addRoute(routeTemplateWithPathParameters, {
            onNavigateTo,
          })

          expect(testRoute.onNavigateTo).toBe(onNavigateTo)
        })

        it('is undefined if no callback was passed', () => {
          const testRoute = addRoute(routeTemplateWithPathParameters)

          expect(testRoute.onNavigateTo).toBe(undefined)
        })
      })
    })
  })
})

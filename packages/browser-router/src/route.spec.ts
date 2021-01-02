import { getSimpluxRouter, SimpluxRoute, SIMPLUX_ROUTE } from '@simplux/router'
import {
  clearAllSimpluxMocks,
  mockEffect,
  mockModuleState,
  mockMutation,
  mockSelector,
} from '@simplux/testing'
import { _module } from './module.js'
import { _routeEffects } from './route.js'
import {
  emptyRouterState,
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
    addChildRoute: undefined!,
    navigateTo: undefined!,
    onNavigateTo: undefined,
    [SIMPLUX_ROUTE]: undefined!,
  }

  const routerAddMock = jest
    .fn()
    .mockImplementationOnce((_, config = {}) => ({
      ...mockRoute,
      ...config,
    }))
    .mockImplementationOnce((_, config = {}) => ({
      ...mockRoute,
      ...config,
      id: 2,
    }))

  const moduleAddMock = jest.fn()
  const moduleAddChildMock = jest.fn()
  const moduleNavigateToIdMock = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    clearAllSimpluxMocks()

    routerAddMock
      .mockReset()
      .mockImplementationOnce((_, config = {}) => ({
        ...mockRoute,
        ...config,
      }))
      .mockImplementationOnce((_, config = {}) => ({
        ...mockRoute,
        ...config,
        id: 2,
      }))
      .mockImplementationOnce((_, config = {}) => ({
        ...mockRoute,
        ...config,
        id: 3,
      }))

    mockEffect(router.addRouteInternal, routerAddMock)
    mockMutation(_module.addRoute, moduleAddMock)
    mockMutation(_module.addChildRoute, moduleAddChildMock)
    mockEffect(_module.navigateToRouteById, moduleNavigateToIdMock)
    jest.clearAllMocks()
  })

  describe(addRoute, () => {
    it('creates a base route using the template as the name', () => {
      mockSelector(_module.parameterNamesForTemplate, () => [
        'param',
        'queryParam',
      ])

      addRoute('root/:param?queryParam')

      expect(routerAddMock).toHaveBeenCalledWith(
        'root/:param?queryParam',
        undefined,
        undefined,
        ['param', 'queryParam'],
      )
    })

    it('adds the route to the module', () => {
      addRoute(routeTemplateWithPathParameters)

      expect(moduleAddMock).toHaveBeenCalledWith(
        1,
        routeTemplateWithPathParameters,
      )
    })

    describe('created route', () => {
      const mockRoute = addRoute('mock')

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
            arrayStringParam: ['a', 'b', 'charlie'],
            arrayNumberParam: [100, -100, 9999999],
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
          const testRoute = addRoute('root[?opt]')

          await testRoute.navigateTo()

          expect(moduleNavigateToIdMock).toHaveBeenCalledWith(1, {})
        })
      })

      describe(mockRoute.href, () => {
        it('delegates to module selector', () => {
          const template = 'root/:pathParam?queryParam'

          const state = _module.addRoute.withState(
            emptyRouterState,
            1,
            template,
          )

          mockModuleState(_module, state)

          const parameterValues = {
            pathParam: 'pathValue',
            queryParam: 'queryValue',
          }

          const testRoute = addRoute(template)

          const href = testRoute.href(parameterValues)

          expect(href).toBe(
            `/${template
              .replace(':pathParam', parameterValues.pathParam)
              .replace(
                'queryParam',
                `queryParam=${parameterValues.queryParam}`,
              )}`,
          )
        })

        it('returns different result for different parameters (tests memoization)', () => {
          const template = 'root/:pathParam?queryParam'

          const state = _module.addRoute.withState(
            emptyRouterState,
            1,
            template,
          )

          mockModuleState(_module, state)

          const testRoute = addRoute(template)

          const href1 = testRoute.href({
            pathParam: 'pathValue',
            queryParam: 'queryValue',
          })

          const href2 = testRoute.href({
            pathParam: 'pathValue2',
            queryParam: 'queryValue2',
          })

          expect(href1).not.toEqual(href2)
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

      describe(mockRoute.addChildRoute, () => {
        const childRoute = mockRoute.addChildRoute('child')

        it('creates a base route using the template as the name', () => {
          mockSelector(
            _module.parameterNamesForTemplate,
            jest
              .fn()
              .mockReturnValueOnce(['parentParam'])
              .mockReturnValueOnce(['parentParam', 'param', 'queryParam']),
          )

          const parentRoute = addRoute('parent/:parentParam')
          parentRoute.addChildRoute('child/:param?queryParam')

          expect(routerAddMock).toHaveBeenCalledWith(
            'child/:param?queryParam',
            undefined,
            1,
            ['parentParam', 'param', 'queryParam'],
          )
        })

        it('adds the child route to the module', () => {
          const parentRoute = addRoute('parent')
          parentRoute.addChildRoute('child')

          expect(moduleAddChildMock).toHaveBeenCalledWith(1, 2, 'child')
        })

        describe(childRoute.isActive, () => {
          it('delegates to the base route', () => {
            const parentRoute = addRoute('parent')
            const testRoute = parentRoute.addChildRoute('child')

            testRoute.isActive()

            expect(isActiveMock).toHaveBeenCalled()
          })
        })

        describe(childRoute.parameterValues, () => {
          it('delegates to the base route', () => {
            const parentRoute = addRoute('parent')
            const testRoute = parentRoute.addChildRoute('child')

            testRoute.parameterValues()

            expect(parameterValuesMock).toHaveBeenCalled()
          })
        })

        describe(childRoute.navigateTo, () => {
          it('delegates to the module', async () => {
            const parentRoute = addRoute('parent')
            const testRoute = parentRoute.addChildRoute('child')

            await testRoute.navigateTo()

            expect(moduleNavigateToIdMock).toHaveBeenCalled()
          })

          it('enforces correct parameters', async () => {
            const parentRoute = addRoute(routeTemplateWithPathParameters)
            const testRoute = parentRoute.addChildRoute('child')

            const parameterValues: typeof testRoute.$parameterTypes = {
              stringParam: 'string',
              numberParam: 100,
              booleanParam: true,
              arrayStringParam: ['a', 'b', 'charlie'],
              arrayNumberParam: [100, -100, 9999999],
            }

            await testRoute.navigateTo(parameterValues)

            expect(moduleNavigateToIdMock).toHaveBeenCalledWith(
              2,
              parameterValues,
            )
          })

          it('makes parameters optional if route has only optional parameters', async () => {
            const parentRoute = addRoute('parent')
            const testRoute = parentRoute.addChildRoute('child[?opt]')

            await testRoute.navigateTo()

            expect(moduleNavigateToIdMock).toHaveBeenCalledWith(2, {})
          })
        })

        describe(childRoute.href, () => {
          it('delegates to module selector', () => {
            const parentTemplate = 'root/:pathParam?queryParam'
            const childTemplate = 'child/:childPathParam?childQueryParam'

            let state = _module.addRoute.withState(
              emptyRouterState,
              1,
              parentTemplate,
            )

            state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

            mockModuleState(_module, state)

            const parameterValues = {
              pathParam: 'pathValue',
              queryParam: 'queryValue',
              childPathParam: 'childPathValue',
              childQueryParam: 'childQueryValue',
            }

            const parentRoute = addRoute(parentTemplate)
            const testRoute = parentRoute.addChildRoute(childTemplate)

            const href = testRoute.href(parameterValues)

            expect(href).toBe(
              `/root/pathValue/child/childPathValue?queryParam=queryValue&childQueryParam=childQueryValue`,
            )
          })
        })
      })
    })
  })
})

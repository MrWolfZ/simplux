import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { SimpluxRouterState, _module } from './module.js'
import { SimpluxRoute, _createRoute } from './route.js'
import {
  routeName3,
  RouteParameters3,
  routerStateWithTwoRoutes,
  routeState2,
} from './testdata.js'

describe(`route`, () => {
  const routeName1 = 'testRoute1'
  const routeName2 = 'testRoute2'

  afterEach(clearAllSimpluxMocks)

  describe(_createRoute, () => {
    it('allows creating route without parameters', () => {
      const [registerMock] = mockEffect(_module.registerRoute, jest.fn())

      const testRoute = _createRoute(routeName1, undefined)
      expect(testRoute.name).toBe(routeName1)
      expect(registerMock).toHaveBeenCalledWith(routeName1, undefined)
    })

    it('allows creating route with parameters', () => {
      const [registerMock] = mockEffect(_module.registerRoute, jest.fn())

      const parameterDefaults = {
        stringParam: 'string',
        numberParam: 100,
        booleanParam: true,
      }

      const testRoute = _createRoute(routeName2, {
        parameterDefaults,
      })

      expect(testRoute.name).toBe(routeName2)
      expect(registerMock).toHaveBeenCalledWith(routeName2, {
        parameterDefaults,
      })
    })

    it('allows creating route with explicit parameters type', () => {
      const [registerMock] = mockEffect(_module.registerRoute, jest.fn())

      const parameterDefaults: Partial<RouteParameters3> = {
        opt: '',
      }

      const testRoute = _createRoute<RouteParameters3>(routeName3, {
        parameterDefaults,
      })

      expect(testRoute.name).toBe(routeName3)
      expect(registerMock).toHaveBeenCalledWith(routeName3, {
        parameterDefaults,
      })
    })

    describe('created route', () => {
      describe(keyOf<SimpluxRoute>('isActive'), () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 1,
        }

        it('returns true if route is active', () => {
          mockEffect(_module.registerRoute, () => 1)
          const testRoute = _createRoute(routeName1, undefined)
          const isActive = testRoute.isActive.withState(stateWithActiveRoute)
          expect(isActive).toBe(true)
        })

        it('returns false if route is inactive', () => {
          mockEffect(_module.registerRoute, () => 2)
          const testRoute = _createRoute(routeName2, undefined)
          const isActive = testRoute.isActive.withState(stateWithActiveRoute)
          expect(isActive).toBe(false)
        })
      })

      describe(keyOf<SimpluxRoute>('parameterValues'), () => {
        const parameterValues = { param: 1 }
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 1,
          activeRouteParameterValues: parameterValues,
        }

        it('returns parameter values for an active route', () => {
          mockEffect(_module.registerRoute, () => 1)
          const testRoute = _createRoute(routeName1, undefined)
          const result = testRoute.parameterValues.withState(
            stateWithActiveRoute,
          )

          expect(result).toEqual(parameterValues)
        })

        it('returns default values for missing values', () => {
          const state: SimpluxRouterState = {
            ...stateWithActiveRoute,
            activeRouteId: 2,
          }

          mockEffect(_module.registerRoute, () => 2)
          const testRoute = _createRoute(routeName2, undefined)

          const result = testRoute.parameterValues.withState(state)

          expect(result).toEqual({
            ...parameterValues,
            ...routeState2.parameterDefaults,
          })
        })

        it('returns parameter values of the correct type', () => {
          mockEffect(_module.registerRoute, () => 1)

          const parameterValues: RouteParameters3 = {
            str: 'string',
            num: 100,
            bool: true,
          }

          const testRoute = _createRoute<RouteParameters3>(
            routeName3,
            undefined,
          )

          const result = testRoute.parameterValues.withState({
            ...stateWithActiveRoute,
            activeRouteParameterValues: parameterValues,
          })

          expect(result.str).toBe(parameterValues.str)
          expect(result.num).toBe(parameterValues.num)
          expect(result.bool).toBe(parameterValues.bool)
          expect(result.opt).toBeUndefined()
        })

        it('throws if route is inactive', () => {
          mockEffect(_module.registerRoute, () => 2)
          const testRoute = _createRoute(routeName2, undefined)
          expect(() =>
            testRoute.parameterValues.withState(stateWithActiveRoute),
          ).toThrow()
        })
      })

      describe(keyOf<SimpluxRoute>('navigateTo'), () => {
        it('navigates to the route', () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())
          const testRoute = _createRoute(routeName1, undefined)
          const parameterValues = { param: 'value' }
          testRoute.navigateTo(parameterValues)
          expect(mock).toHaveBeenCalledWith(1, parameterValues)
        })

        it('enforces correct parameters', () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())

          const parameterValues: RouteParameters3 = {
            str: 'string',
            num: 100,
            bool: true,
          }

          const testRoute = _createRoute<RouteParameters3>(
            routeName1,
            undefined,
          )

          testRoute.navigateTo(parameterValues)

          expect(mock).toHaveBeenCalledWith(1, parameterValues)
        })
      })
    })
  })
})

function keyOf<T>(key: keyof T) {
  return key
}

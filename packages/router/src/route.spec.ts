import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { SimpluxRouterState, _module } from './module.js'
import { SimpluxRoute, _routeEffects } from './route.js'
import {
  routeName1,
  routeName2,
  routeName3,
  RouteParameters3,
  routerStateWithTwoRoutes,
} from './testdata.js'

const addRoute = _routeEffects.addRoute

describe(`route`, () => {
  afterEach(clearAllSimpluxMocks)

  describe(addRoute, () => {
    it('allows creating route without configuration', () => {
      const [registerMock] = mockEffect(
        _module.registerRoute,
        jest.fn().mockReturnValue(1),
      )

      const testRoute = addRoute(routeName1)
      expect(testRoute.id).toBe(1)
      expect(testRoute.name).toBe(routeName1)
      expect(registerMock).toHaveBeenCalledWith(routeName1, undefined)
    })

    it('allows creating route with configuration', () => {
      const [registerMock] = mockEffect(
        _module.registerRoute,
        jest.fn().mockReturnValue(1),
      )

      const testRoute = addRoute(routeName2, {})

      expect(testRoute.id).toBe(1)
      expect(testRoute.name).toBe(routeName2)
      expect(registerMock).toHaveBeenCalledWith(routeName2, {})
    })

    it('allows creating route with explicit parameters type', () => {
      const [registerMock] = mockEffect(
        _module.registerRoute,
        jest.fn().mockReturnValue(1),
      )

      const testRoute = addRoute<RouteParameters3>(routeName3, {})

      expect(testRoute.id).toBe(1)
      expect(testRoute.name).toBe(routeName3)
      expect(registerMock).toHaveBeenCalledWith(routeName3, {})
    })

    describe('created route', () => {
      describe(keyOf<SimpluxRoute>('isActive'), () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 1,
        }

        it('returns true if route is active', () => {
          mockEffect(_module.registerRoute, () => 1)
          const testRoute = addRoute(routeName1)
          const isActive = testRoute.isActive.withState(stateWithActiveRoute)
          expect(isActive).toBe(true)
        })

        it('returns false if route is inactive', () => {
          mockEffect(_module.registerRoute, () => 2)
          const testRoute = addRoute(routeName2)
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
          const testRoute = addRoute(routeName1)
          const result = testRoute.parameterValues.withState(
            stateWithActiveRoute,
          )

          expect(result).toEqual(parameterValues)
        })

        it('returns parameter values of the correct type', () => {
          mockEffect(_module.registerRoute, () => 1)

          const parameterValues: RouteParameters3 = {
            str: 'string',
            num: 100,
            bool: true,
          }

          const testRoute = addRoute<RouteParameters3>(routeName3)

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
          const testRoute = addRoute(routeName2)
          expect(() =>
            testRoute.parameterValues.withState(stateWithActiveRoute),
          ).toThrow()
        })
      })

      describe(keyOf<SimpluxRoute>('navigateTo'), () => {
        it('navigates to the route', () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())
          const parameterValues = { param: 'value' }
          const testRoute = addRoute<typeof parameterValues>(
            routeName1,
            undefined,
          )

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

          const testRoute = addRoute<RouteParameters3>(routeName1)

          testRoute.navigateTo(parameterValues)

          expect(mock).toHaveBeenCalledWith(1, parameterValues)
        })

        it('does not take parameters if route has none', () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())

          const testRoute = addRoute(routeName1)

          testRoute.navigateTo()

          expect(mock).toHaveBeenCalledWith(1, {})
        })

        it('makes parameters optional if route has only optional parameters', () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())

          interface Parameters {
            opt?: string
          }

          const testRoute = addRoute<Parameters>(routeName1)

          testRoute.navigateTo()

          expect(mock).toHaveBeenCalledWith(1, {})
        })
      })
    })
  })
})

function keyOf<T>(key: keyof T) {
  return key
}

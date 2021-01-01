import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { _module, _RouterState } from './module.js'
import { SimpluxRoute, SIMPLUX_ROUTE, _routeEffects } from './route.js'
import {
  routeName1,
  routeName2,
  routeName3,
  RouteParameters3,
  routerStateWithTwoRoutes,
  routerStateWithTwoRoutesAndOneChild,
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
      it('has the marker', () => {
        mockEffect(_module.registerRoute, () => 1)

        const testRoute = addRoute(routeName1)

        expect(
          Object.prototype.hasOwnProperty.call(testRoute, SIMPLUX_ROUTE),
        ).toBe(true)
      })

      describe(keyOf<SimpluxRoute<any, any>>('onNavigateTo'), () => {
        it('is the passed callback', () => {
          mockEffect(_module.registerRoute, () => 1)

          const onNavigateTo = jest.fn()
          const testRoute = addRoute(routeName2, { onNavigateTo })

          expect(testRoute.onNavigateTo).toBe(onNavigateTo)
        })

        it('is undefined if no callback was passed', () => {
          mockEffect(_module.registerRoute, () => 1)

          const testRoute = addRoute(routeName2, {})

          expect(testRoute.onNavigateTo).toBe(undefined)
        })
      })

      describe(keyOf<SimpluxRoute<any, any>>('isActive'), () => {
        const stateWithActiveRoute: _RouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteIds: 1,
        }

        it('returns true if route is active', () => {
          mockEffect(_module.registerRoute, () => 1)
          const testRoute = addRoute(routeName1)

          const isActive = testRoute.isActive.withState(
            stateWithActiveRoute as never,
          )

          expect(isActive).toBe(true)
        })

        it('returns false if route is inactive', () => {
          mockEffect(_module.registerRoute, () => 2)
          const testRoute = addRoute(routeName2)

          const isActive = testRoute.isActive.withState(
            stateWithActiveRoute as never,
          )

          expect(isActive).toBe(false)
        })

        it('returns true if child route is active', () => {
          mockEffect(_module.registerRoute, () => 1)
          mockEffect(_module.registerChildRoute, () => 2)

          const parentRoute = addRoute(routeName1)
          parentRoute.addChildRoute(routeName2)

          const state: _RouterState = {
            ...routerStateWithTwoRoutesAndOneChild,
            activeRouteIds: [1, 2],
          }

          const isActive = parentRoute.isActive.withState(state as never)

          expect(isActive).toBe(true)
        })
      })

      describe(keyOf<SimpluxRoute<any, any>>('parameterValues'), () => {
        const parameterValues = { param: 1 }
        const stateWithActiveRoute: _RouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteIds: 1,
          activeRouteParameterValues: parameterValues,
        }

        it('returns parameter values for an active route', () => {
          mockEffect(_module.registerRoute, () => 1)
          const testRoute = addRoute(routeName1)
          const result = testRoute.parameterValues.withState(
            stateWithActiveRoute as never,
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
          } as never)

          expect(result.str).toBe(parameterValues.str)
          expect(result.num).toBe(parameterValues.num)
          expect(result.bool).toBe(parameterValues.bool)
          expect(result.opt).toBeUndefined()
        })

        it('returns parameter values of the correct type for child route', () => {
          mockEffect(_module.registerRoute, () => 1)
          mockEffect(_module.registerChildRoute, () => 2)

          const parentParameterValues = {
            parent: 'p',
          }

          const childParameterValues = {
            child: 'p',
          }

          const parentRoute = addRoute<typeof parentParameterValues>(routeName1)
          const childRoute = parentRoute.addChildRoute<
            typeof childParameterValues
          >(routeName2)

          const result = childRoute.parameterValues.withState({
            ...routerStateWithTwoRoutesAndOneChild,
            activeRouteIds: [1, 2],
            activeRouteParameterValues: {
              ...parentParameterValues,
              ...childParameterValues,
            },
          } as never)

          expect(result.parent).toBe(parentParameterValues.parent)
          expect(result.child).toBe(childParameterValues.child)
        })

        it('throws if route is inactive', () => {
          mockEffect(_module.registerRoute, () => 2)
          const testRoute = addRoute(routeName2)
          expect(() =>
            testRoute.parameterValues.withState(stateWithActiveRoute as never),
          ).toThrow()
        })
      })

      describe(keyOf<SimpluxRoute<any, any>>('navigateTo'), () => {
        it('navigates to the route', async () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())
          mock.mockResolvedValueOnce(void 0)

          const parameterValues = { param: 'value' }
          const testRoute = addRoute<typeof parameterValues>(
            routeName1,
            undefined,
          )

          await testRoute.navigateTo(parameterValues)

          expect(mock).toHaveBeenCalledWith(1, parameterValues)
        })

        it('enforces correct parameters', async () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())
          mock.mockResolvedValueOnce(void 0)

          const parameterValues: RouteParameters3 = {
            str: 'string',
            num: 100,
            bool: true,
          }

          const testRoute = addRoute<RouteParameters3>(routeName1)

          await testRoute.navigateTo(parameterValues)

          expect(mock).toHaveBeenCalledWith(1, parameterValues)
        })

        it('does not take parameters if route has none', async () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())

          const testRoute = addRoute(routeName1)

          await testRoute.navigateTo()

          expect(mock).toHaveBeenCalledWith(1, {})
        })

        it('makes parameters optional if route has only optional parameters', async () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())

          interface Parameters {
            opt?: string
          }

          const testRoute = addRoute<Parameters>(routeName1)

          await testRoute.navigateTo()

          expect(mock).toHaveBeenCalledWith(1, {})
        })
      })
    })
  })

  describe('adding child route', () => {
    it('allows creating route without configuration', () => {
      const [registerMock] = mockEffect(
        _module.registerRoute,
        jest.fn().mockReturnValue(1),
      )

      const [registerChildMock] = mockEffect(
        _module.registerChildRoute,
        jest.fn().mockReturnValue(2),
      )

      const parentRoute = addRoute(routeName1)
      const childRoute = parentRoute.addChildRoute(routeName2)

      expect(childRoute.id).toBe(2)
      expect(childRoute.name).toBe(routeName2)
      expect(registerMock).toHaveBeenCalledWith(routeName1, undefined)
      expect(registerChildMock).toHaveBeenCalledWith(1, routeName2, undefined)
    })

    it('allows creating route with configuration', () => {
      const [registerMock] = mockEffect(
        _module.registerRoute,
        jest.fn().mockReturnValue(1),
      )

      const [registerChildMock] = mockEffect(
        _module.registerChildRoute,
        jest.fn().mockReturnValue(2),
      )

      const parentRoute = addRoute(routeName1)
      const childRoute = parentRoute.addChildRoute(routeName2, {})

      expect(childRoute.id).toBe(2)
      expect(childRoute.name).toBe(routeName2)
      expect(registerMock).toHaveBeenCalledWith(routeName1, undefined)
      expect(registerChildMock).toHaveBeenCalledWith(1, routeName2, {})
    })

    it('allows creating route with explicit parameters type', () => {
      const [registerMock] = mockEffect(
        _module.registerRoute,
        jest.fn().mockReturnValue(1),
      )

      const [registerChildMock] = mockEffect(
        _module.registerChildRoute,
        jest.fn().mockReturnValue(2),
      )

      const parentRoute = addRoute(routeName1)
      const childRoute = parentRoute.addChildRoute<RouteParameters3>(
        routeName3,
        {},
      )

      expect(childRoute.id).toBe(2)
      expect(childRoute.name).toBe(routeName3)
      expect(registerMock).toHaveBeenCalledWith(routeName1, undefined)
      expect(registerChildMock).toHaveBeenCalledWith(1, routeName3, {})
    })
  })
})

function keyOf<T>(key: keyof T) {
  return key
}

import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { SimpluxRouterState, _module } from './module.js'
import { SimpluxRoute, _createRoute } from './route.js'
import { routeState1, routeState2 } from './testdata.js'

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

    describe('created route', () => {
      describe(keyOf<SimpluxRoute<string, {}>>('isActive'), () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          routes: [{ ...routeState1, isActive: true }, routeState2],
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

      describe(keyOf<SimpluxRoute<string, {}>>('parameterValues'), () => {
        const parameterValues = { param: 1 }
        const stateWithActiveRoute: SimpluxRouterState = {
          routes: [
            { ...routeState1, isActive: true, parameterValues },
            routeState2,
          ],
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
            routes: [{ ...routeState2, isActive: true, parameterValues }],
          }

          mockEffect(_module.registerRoute, () => 1)
          const testRoute = _createRoute(routeName2, undefined)

          const result = testRoute.parameterValues.withState(state)

          expect(result).toEqual({
            ...parameterValues,
            ...routeState2.parameterDefaults,
          })
        })

        it('throws if route is inactive', () => {
          mockEffect(_module.registerRoute, () => 2)
          const testRoute = _createRoute(routeName2, undefined)
          expect(() =>
            testRoute.parameterValues.withState(stateWithActiveRoute),
          ).toThrow()
        })
      })

      describe(keyOf<SimpluxRoute<string, {}>>('navigateTo'), () => {
        it('navigates to the route', () => {
          mockEffect(_module.registerRoute, () => 1)
          const [mock] = mockEffect(_module.navigateToRoute, jest.fn())
          const testRoute = _createRoute(routeName1, undefined)
          const parameterValues = { param: 'value' }
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

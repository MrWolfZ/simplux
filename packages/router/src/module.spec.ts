import {
  clearAllSimpluxMocks,
  mockModuleState,
  mockMutation,
} from '@simplux/testing'
import { SimpluxRouterState, _module } from './module.js'
import {
  emptyRouterState,
  routeName1,
  routeName2,
  routerStateWithRoute1,
  routerStateWithRoute2,
  routerStateWithTwoRoutes,
  routeState2,
} from './testdata.js'

describe(`module`, () => {
  let nodeEnv: string | undefined

  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv
  })

  afterEach(clearAllSimpluxMocks)

  it('starts with an empty state', () => {
    expect(_module.state()).toEqual(emptyRouterState)
  })

  describe('mutations', () => {
    describe(_module.addRoute, () => {
      it('allows registering route without parameters', () => {
        const updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )
        expect(updatedState).toEqual(routerStateWithRoute1)
      })

      it('allows registering route with parameters', () => {
        const updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName2,
          {
            parameterDefaults: {
              stringParam: 'string',
              numberParam: 100,
              booleanParam: true,
            },
          },
        )

        expect(updatedState).toEqual(routerStateWithRoute2)
      })

      it('allows registering multiple routes', () => {
        let updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )

        updatedState = _module.addRoute.withState(updatedState, routeName2, {
          parameterDefaults: {
            stringParam: 'string',
            numberParam: 100,
            booleanParam: true,
          },
        })

        expect(updatedState).toEqual(routerStateWithTwoRoutes)
      })
    })

    describe(_module.activateRoute, () => {
      it('marks the route as active', () => {
        const updatedState = _module.activateRoute.withState(
          routerStateWithRoute1,
          1,
          {},
        )

        expect(updatedState.activeRouteId).toBe(1)
      })

      it('sets the parameter values', () => {
        const parameterValues = { param: 'value' }
        const updatedState = _module.activateRoute.withState(
          routerStateWithRoute1,
          1,
          parameterValues,
        )

        expect(updatedState.activeRouteParameterValues).toBe(parameterValues)
      })

      it('overwrites the active route ID', () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 2,
        }

        const updatedState = _module.activateRoute.withState(
          stateWithActiveRoute,
          1,
          {},
        )

        expect(updatedState.activeRouteId).toBe(1)
      })

      it('overwrites the active parameters', () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 2,
          activeRouteParameterValues: { param: 'value' },
        }

        const newParameterValues = { otherParam: 'newValue' }

        const updatedState = _module.activateRoute.withState(
          stateWithActiveRoute,
          1,
          newParameterValues,
        )

        expect(updatedState.activeRouteParameterValues).toEqual(
          newParameterValues,
        )
      })

      it('updates the parameter values if the route was already active', () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithRoute1,
          activeRouteId: 1,
          activeRouteParameterValues: { param: 'value' },
        }

        const newParameterValues = { otherParam: 'newValue' }

        const updatedState = _module.activateRoute.withState(
          stateWithActiveRoute,
          1,
          newParameterValues,
        )

        expect(updatedState.activeRouteParameterValues).toEqual(
          newParameterValues,
        )
      })
    })
  })

  describe('selectors', () => {
    describe(_module.routeIsActive, () => {
      const stateWithActiveRoute: SimpluxRouterState = {
        ...routerStateWithTwoRoutes,
        activeRouteId: 1,
        activeRouteParameterValues: {},
      }

      it('returns true for an active route', () => {
        const isActive = _module.routeIsActive.withState(
          stateWithActiveRoute,
          1,
        )
        expect(isActive).toBe(true)
      })

      it('returns false for an inactive route', () => {
        const isActive = _module.routeIsActive.withState(
          stateWithActiveRoute,
          2,
        )
        expect(isActive).toBe(false)
      })

      it('returns false for a non-existing route', () => {
        const isActive = _module.routeIsActive.withState(
          stateWithActiveRoute,
          3,
        )
        expect(isActive).toBe(false)
      })
    })

    describe(_module.routeParameterValues, () => {
      const parameterValues = { param: 1 }
      const stateWithActiveRoute: SimpluxRouterState = {
        ...routerStateWithTwoRoutes,
        activeRouteId: 1,
        activeRouteParameterValues: parameterValues,
      }

      it('returns parameter values for an active route', () => {
        const result = _module.routeParameterValues.withState(
          stateWithActiveRoute,
          1,
        )

        expect(result).toEqual(parameterValues)
      })

      it('returns default values for missing values', () => {
        const state: SimpluxRouterState = {
          ...stateWithActiveRoute,
          activeRouteId: 2,
        }

        const result = _module.routeParameterValues.withState(state, 2)

        expect(result).toEqual({
          ...parameterValues,
          ...routeState2.parameterDefaults,
        })
      })

      it('throws for an inactive route', () => {
        expect(() =>
          _module.routeParameterValues.withState(stateWithActiveRoute, 2),
        ).toThrow()
      })

      it('throws for a non-existing route', () => {
        expect(() =>
          _module.routeParameterValues.withState(stateWithActiveRoute, 3),
        ).toThrow()
      })

      it('returns an empty object for an inactive route in production', () => {
        process.env.NODE_ENV = 'production'

        const result = _module.routeParameterValues.withState(
          stateWithActiveRoute,
          2,
        )

        expect(result).toEqual({})
      })

      it('returns an empty object for a non-existing route in production', () => {
        process.env.NODE_ENV = 'production'

        const result = _module.routeParameterValues.withState(
          stateWithActiveRoute,
          3,
        )

        expect(result).toEqual({})
      })
    })
  })

  describe('effects', () => {
    describe(_module.registerRoute, () => {
      it('allows registering route without parameters', () => {
        mockMutation(_module.addRoute, () => routerStateWithRoute1)
        const routeId = _module.registerRoute(routeName1)
        expect(routeId).toEqual(1)
      })

      it('allows registering route with parameters', () => {
        mockMutation(_module.addRoute, () => routerStateWithRoute2)

        const routeId = _module.registerRoute(routeName2, {
          parameterDefaults: {
            stringParam: 'string',
            numberParam: 100,
            booleanParam: true,
          },
        })

        expect(routeId).toEqual(1)
      })

      it('allows registering multiple routes', () => {
        mockMutation(
          _module.addRoute,
          jest
            .fn()
            .mockReturnValueOnce(routerStateWithRoute1)
            .mockReturnValueOnce(routerStateWithTwoRoutes),
        )

        const routeId1 = _module.registerRoute(routeName1)

        const routeId2 = _module.registerRoute(routeName2, {
          parameterDefaults: {
            stringParam: 'string',
            numberParam: 100,
            booleanParam: true,
          },
        })

        expect(routeId1).toEqual(1)
        expect(routeId2).toEqual(2)
      })
    })

    describe(_module.navigateToRoute, () => {
      it('activates the route', () => {
        mockModuleState(_module, routerStateWithRoute1)

        const [mock] = mockMutation(_module.activateRoute, jest.fn())

        const parameterValues = { param: 'value' }
        _module.navigateToRoute(1, parameterValues)

        expect(mock).toHaveBeenCalledWith(1, parameterValues)
      })
    })
  })
})

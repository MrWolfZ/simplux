import {
  clearAllSimpluxMocks,
  mockModuleState,
  mockMutation,
} from '@simplux/testing'
import type { SimpluxModuleLike } from '../../core/index.js'
import { SimpluxRouterState, _module } from './module.js'
import {
  emptyRouterState,
  routeName1,
  routeName2,
  routerStateWithRoute1,
  routerStateWithRoute2,
  routerStateWithTwoRoutes,
  routeState1,
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

  describe(_module.registerRoute, () => {
    it('allows registering route without parameters', () => {
      mockMutation(
        _module.addRoute,
        jest.fn().mockReturnValueOnce(routerStateWithRoute1),
      )

      const routeId = _module.registerRoute(routeName1)
      expect(routeId).toEqual(1)
    })

    it('allows registering route with parameters', () => {
      mockMutation(
        _module.addRoute,
        jest.fn().mockReturnValueOnce(routerStateWithRoute2),
      )

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

  describe(_module.routeIsActive, () => {
    const stateWithActiveRoute: SimpluxRouterState = {
      routes: [{ ...routeState1, isActive: true }, routeState2],
    }

    it('returns true for an active route', () => {
      const isActive = _module.routeIsActive.withState(stateWithActiveRoute, 1)
      expect(isActive).toBe(true)
    })

    it('returns false for an inactive route', () => {
      const isActive = _module.routeIsActive.withState(stateWithActiveRoute, 2)
      expect(isActive).toBe(false)
    })

    it('returns false for a non-existing route', () => {
      const isActive = _module.routeIsActive.withState(stateWithActiveRoute, 3)
      expect(isActive).toBe(false)
    })
  })

  describe(_module.routeParameterValues, () => {
    const parameterValues = { param: 1 }
    const stateWithActiveRoute: SimpluxRouterState = {
      routes: [
        { ...routeState1, isActive: true, parameterValues },
        routeState2,
      ],
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
        routes: [{ ...routeState2, isActive: true, parameterValues }],
      }

      const result = _module.routeParameterValues.withState(state, 1)

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

    it('does not throw for an inactive route in production', () => {
      process.env.NODE_ENV = 'production'

      expect(() =>
        _module.routeParameterValues.withState(stateWithActiveRoute, 2),
      ).not.toThrow()
    })

    it('does not throw for a non-existing route in production', () => {
      process.env.NODE_ENV = 'production'

      expect(() =>
        _module.routeParameterValues.withState(stateWithActiveRoute, 3),
      ).not.toThrow()
    })
  })

  describe(_module.activateRoute, () => {
    const state: SimpluxRouterState = {
      routes: [routeState1],
    }

    it('marks the route as active', () => {
      const updatedState = _module.activateRoute.withState(state, 1, {})
      expect(updatedState.routes[0].isActive).toBe(true)
    })

    it('sets the parameter values', () => {
      const parameterValues = { param: 'value' }
      const updatedState = _module.activateRoute.withState(
        state,
        1,
        parameterValues,
      )

      expect(updatedState.routes[0].parameterValues).toBe(parameterValues)
    })

    it('marks other routes as inactive', () => {
      const stateWithActiveRoute: SimpluxRouterState = {
        routes: [routeState1, { ...routeState2, isActive: true }],
      }

      const updatedState = _module.activateRoute.withState(
        stateWithActiveRoute,
        1,
        {},
      )

      expect(updatedState.routes[1].isActive).toBe(false)
    })

    it('clears parameters of other routes', () => {
      const stateWithActiveRoute: SimpluxRouterState = {
        routes: [
          routeState1,
          {
            ...routeState2,
            isActive: true,
            parameterValues: { param: 'value' },
          },
        ],
      }

      const updatedState = _module.activateRoute.withState(
        stateWithActiveRoute,
        1,
        {},
      )

      expect(updatedState.routes[1].parameterValues).toEqual({})
    })

    it('updates the parameter values if the route was already active', () => {
      const parameterValues = { param: 'value' }
      const updatedState = _module.activateRoute.withState(
        { routes: [{ ...routeState1, isActive: true }] },
        1,
        parameterValues,
      )

      expect(updatedState.routes[0].parameterValues).toBe(parameterValues)
    })
  })

  describe(_module.navigateToRoute, () => {
    const state: SimpluxRouterState = {
      routes: [routeState1],
    }

    it('activates the route', () => {
      mockModuleState(
        // cast is workaround for issue with composite builds
        (_module as unknown) as SimpluxModuleLike<SimpluxRouterState>,
        state,
      )

      const [mock] = mockMutation(_module.activateRoute, jest.fn())

      const parameterValues = { param: 'value' }
      _module.navigateToRoute(1, parameterValues)

      expect(mock).toHaveBeenCalledWith(1, parameterValues)
    })
  })
})

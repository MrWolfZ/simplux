import { clearAllSimpluxMocks, mockMutation } from '@simplux/testing'
import { SimpluxRouterState, _module } from './module.js'
import {
  emptyRouterState,
  routeName1,
  routeName2,
  routerStateWithRoute1,
  routerStateWithTwoRoutes,
} from './testdata.js'

describe(`module`, () => {
  let nodeEnv: string | undefined

  beforeEach(() => {
    nodeEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    process.env.NODE_ENV = nodeEnv
  })

  beforeEach(() => {
    mockMutation(_module.addRoute, jest.fn())
    mockMutation(_module.activateRoute, jest.fn())
    mockMutation(_module.setNavigationIsInProgress, jest.fn())
  })

  afterEach(clearAllSimpluxMocks)

  it('starts with an empty state', () => {
    expect(_module.state()).toEqual(emptyRouterState)
  })

  describe('mutations', () => {
    describe(_module.addRoute, () => {
      it('allows registering route', () => {
        const updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )

        expect(updatedState).toEqual(routerStateWithRoute1)
      })

      it('allows registering multiple routes', () => {
        let updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )

        updatedState = _module.addRoute.withState(updatedState, routeName2)

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

    describe(_module.setNavigationIsInProgress, () => {
      it('sets the property', () => {
        const updatedState = _module.setNavigationIsInProgress.withState(
          emptyRouterState,
          true,
        )

        expect(updatedState.navigationIsInProgress).toBe(true)
      })
    })
  })

  describe('selectors', () => {
    describe(_module.anyRouteIsActive, () => {
      it('returns true for an active route', () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 1,
          activeRouteParameterValues: {},
        }

        const isActive = _module.routeIsActive.withState(
          stateWithActiveRoute,
          1,
        )

        expect(isActive).toBe(true)
      })

      it('returns false for an inactive route', () => {
        const stateWithActiveRoute: SimpluxRouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: undefined,
          activeRouteParameterValues: {},
        }

        const isActive = _module.routeIsActive.withState(
          stateWithActiveRoute,
          2,
        )

        expect(isActive).toBe(false)
      })
    })

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
      it('allows registering route', () => {
        mockMutation(_module.addRoute, () => routerStateWithRoute1)
        const routeId = _module.registerRoute(routeName1)
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

        const routeId2 = _module.registerRoute(routeName2, {})

        expect(routeId1).toEqual(1)
        expect(routeId2).toEqual(2)
      })
    })

    describe(_module.navigateToRoute, () => {
      it('activates the route at the end of the navigation', async () => {
        const [mock] = mockMutation(_module.activateRoute, jest.fn())

        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(
          1,
          parameterValues,
          () => onNavToPromise,
        )

        expect(mock).not.toHaveBeenCalled()

        resolve()
        await promise

        expect(mock).toHaveBeenCalledWith(1, parameterValues)
      })

      it('marks navigation as running at the start of the navigation', async () => {
        const [mock] = mockMutation(
          _module.setNavigationIsInProgress,
          jest.fn(),
        )

        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(
          1,
          parameterValues,
          () => onNavToPromise,
        )

        expect(mock).toHaveBeenCalledWith(true)

        resolve()
        await promise
      })

      it('marks navigation as not running at the end of the navigation', async () => {
        const [mock] = mockMutation(
          _module.setNavigationIsInProgress,
          jest.fn(),
        )

        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(
          1,
          parameterValues,
          () => onNavToPromise,
        )

        mock.mockClear()

        resolve()
        await promise

        expect(mock).toHaveBeenCalledWith(false)
      })
    })
  })
})

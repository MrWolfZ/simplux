import {
  clearAllSimpluxMocks,
  mockEffect,
  mockMutation,
} from '@simplux/testing'
import {
  NAVIGATION_CANCELLED,
  NAVIGATION_FINISHED,
  OnNavigateToExtras,
  _module,
  _RouterState,
} from './module.js'
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
    mockEffect(_module.createNavigationCancellationPromise, jest.fn())
    mockEffect(_module.cancelNavigationInProgress, jest.fn())
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
        const stateWithActiveRoute: _RouterState = {
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
        const stateWithActiveRoute: _RouterState = {
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
        const stateWithActiveRoute: _RouterState = {
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
        const state: _RouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteId: 1,
          activeRouteParameterValues: {},
        }

        const anyRouteIsActive = _module.anyRouteIsActive.withState(state)
        expect(anyRouteIsActive).toBe(true)
      })

      it('returns false for an inactive route', () => {
        const state = routerStateWithTwoRoutes
        const anyRouteIsActive = _module.anyRouteIsActive.withState(state)
        expect(anyRouteIsActive).toBe(false)
      })
    })

    describe(_module.navigationIsInProgress, () => {
      it('returns true if navigation is in progress', () => {
        const state: _RouterState = {
          ...routerStateWithTwoRoutes,
          navigationIsInProgress: true,
        }

        const navIsInProgress = _module.navigationIsInProgress.withState(state)
        expect(navIsInProgress).toBe(true)
      })

      it('returns false if navigation is not in progress', () => {
        const state = routerStateWithTwoRoutes
        const navIsInProgress = _module.navigationIsInProgress.withState(state)
        expect(navIsInProgress).toBe(false)
      })
    })

    describe(_module.routeIsActive, () => {
      const stateWithActiveRoute: _RouterState = {
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
      const stateWithActiveRoute: _RouterState = {
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

      it('stores the onNavigateTo function', () => {
        mockMutation(_module.addRoute, () => routerStateWithRoute1)
        const [addInterceptorMock] = mockEffect(
          _module.addOnNavigateToInterceptor,
          jest.fn(),
        )

        const onNavigateTo = jest.fn()
        _module.registerRoute(routeName1, { onNavigateTo })

        expect(addInterceptorMock).toHaveBeenCalledWith(1, onNavigateTo)
      })
    })

    describe(_module.navigateToRoute, () => {
      it('calls the onNavigateTo interceptor for the route', async () => {
        const interceptor = jest.fn().mockResolvedValueOnce(undefined)
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: interceptor,
        }))

        const parameterValues = { param: 'value' }
        await _module.navigateToRoute(1, parameterValues)

        expect(interceptor).toHaveBeenCalledWith(
          parameterValues,
          expect.anything(),
        )
      })

      it('calls the onNavigateTo interceptor for the route without parameters', async () => {
        const interceptor = jest.fn().mockResolvedValueOnce(undefined)
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: interceptor,
        }))

        await _module.navigateToRoute(1)

        expect(interceptor).toHaveBeenCalledWith({}, expect.anything())
      })

      it('activates the route at the end of the navigation', async () => {
        const [mock] = mockMutation(_module.activateRoute, jest.fn())

        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => onNavToPromise,
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

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
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => onNavToPromise,
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

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
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => onNavToPromise,
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        mock.mockClear()

        resolve()
        await promise

        expect(mock).toHaveBeenCalledWith(false)
      })

      it('cancels navigation in progress', async () => {
        const [mock] = mockEffect(_module.cancelNavigationInProgress, jest.fn())

        const parameterValues = { param: 'value' }
        await _module.navigateToRoute(1, parameterValues)

        expect(mock).toHaveBeenCalled()
      })

      it('does not activate the route if navigation is cancelled', async () => {
        const [activateMock] = mockMutation(_module.activateRoute, jest.fn())
        const [mock] = mockEffect(
          _module.createNavigationCancellationPromise,
          jest.fn(),
        )

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => new Promise<void>(() => {}),
        }))

        let cancelNav = () => {}
        const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        mock.mockReturnValueOnce(cancelPromise)

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        cancelNav()
        await promise

        expect(activateMock).not.toHaveBeenCalled()
      })

      it('returns the correct value if navigation succeeds', async () => {
        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => onNavToPromise,
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        resolve()

        await expect(promise).resolves.toBe(NAVIGATION_FINISHED)
      })

      it('returns the correct value if navigation is cancelled', async () => {
        const [mock] = mockEffect(
          _module.createNavigationCancellationPromise,
          jest.fn(),
        )

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => new Promise<void>(() => {}),
        }))

        let cancelNav = () => {}
        const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        mock.mockReturnValueOnce(cancelPromise)

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        cancelNav()

        await expect(promise).resolves.toBe(NAVIGATION_CANCELLED)
      })

      it('clears cancellation callback at the end of the navigation', async () => {
        mockMutation(_module.activateRoute, jest.fn())
        const [mock] = mockEffect(
          _module.clearNavigationCancellationCallback,
          jest.fn(),
        )

        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => onNavToPromise,
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        expect(mock).not.toHaveBeenCalled()

        resolve()
        await promise

        expect(mock).toHaveBeenCalled()
      })

      it('notifies the onNavigateTo interceptor for the route of cancellation', async () => {
        let cancellationPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          () => {},
        )

        const [createCancelPromiseMock] = mockEffect(
          _module.createNavigationCancellationPromise,
          jest.fn(),
        )

        let cancelNav = () => {}
        const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        createCancelPromiseMock.mockReturnValueOnce(cancelPromise)

        const interceptor = jest
          .fn<Promise<void>, [any, OnNavigateToExtras]>()
          .mockImplementationOnce((_, { cancelled }) => {
            cancellationPromise = cancelled
            return new Promise<void>(() => {})
          })

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: interceptor,
        }))

        const promise = _module.navigateToRoute(1)

        cancelNav()

        await expect(cancellationPromise).resolves.toBe(NAVIGATION_CANCELLED)
        await promise
      })

      it('cancels navigation if onNavigateTo wants to cancel navigation', async () => {
        const interceptor = jest
          .fn<Promise<typeof NAVIGATION_CANCELLED>, [any, OnNavigateToExtras]>()
          .mockImplementationOnce((_, { cancelNavigation }) => {
            return Promise.resolve(cancelNavigation)
          })

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: interceptor,
        }))

        const promise = _module.navigateToRoute(1)

        await expect(promise).resolves.toBe(NAVIGATION_CANCELLED)
      })

      it('cancels navigation if onNavigateTo redirects navigation synchronously', async () => {
        const [activateMock] = mockMutation(_module.activateRoute, jest.fn())
        const [mock] = mockEffect(
          _module.createNavigationCancellationPromise,
          jest.fn(),
        )

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => {
            cancelNav()
            return NAVIGATION_FINISHED
          },
        }))

        let cancelNav = () => {}
        const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        mock.mockReturnValueOnce(cancelPromise)

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        await promise

        expect(activateMock).not.toHaveBeenCalled()
      })

      it('cancels navigation if onNavigateTo redirects navigation asynchronously', async () => {
        const [activateMock] = mockMutation(_module.activateRoute, jest.fn())
        const [mock] = mockEffect(
          _module.createNavigationCancellationPromise,
          jest.fn(),
        )

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: async () => {
            cancelNav()
            await Promise.resolve()
            return NAVIGATION_FINISHED as any
          },
        }))

        let cancelNav = () => {}
        const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        mock.mockReturnValueOnce(cancelPromise)

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        await promise

        expect(activateMock).not.toHaveBeenCalled()
      })

      it('rejects the navigation if onNavigateTo throws', async () => {
        const [activateMock] = mockMutation(_module.activateRoute, jest.fn())

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => {
            throw new Error()
          },
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        await expect(promise).rejects.toBeDefined()
        expect(activateMock).not.toHaveBeenCalled()
      })

      it('rejects the navigation if onNavigateTo rejects', async () => {
        const [activateMock] = mockMutation(_module.activateRoute, jest.fn())

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => Promise.reject(new Error()),
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        await expect(promise).rejects.toBeDefined()
        expect(activateMock).not.toHaveBeenCalled()
      })
    })

    describe('onNavigateTo interceptors', () => {
      afterEach(_module.clearOnNavigateToInterceptors)

      it('can be added', () => {
        const interceptor = jest.fn()
        _module.addOnNavigateToInterceptor(1, interceptor)

        const interceptors = _module.getOnNavigateToInterceptors()

        expect(interceptors).toEqual({ 1: interceptor })
      })

      it('can be cleared', () => {
        const interceptor = jest.fn()
        _module.addOnNavigateToInterceptor(1, interceptor)

        _module.clearOnNavigateToInterceptors()

        const interceptors = _module.getOnNavigateToInterceptors()
        expect(interceptors).toEqual({})
      })
    })

    describe('cancellation', () => {
      it('promise can be created and then cancelled', async () => {
        clearAllSimpluxMocks()

        const promise = _module.createNavigationCancellationPromise()

        _module.cancelNavigationInProgress()

        await expect(promise).resolves.toBe(NAVIGATION_CANCELLED)
      })

      it('callback can be cleaned up', async () => {
        clearAllSimpluxMocks()

        const promise = _module.createNavigationCancellationPromise()

        _module.clearNavigationCancellationCallback()

        let isResolved = false
        promise.then(
          () => (isResolved = true),
          () => (isResolved = true),
        )

        _module.cancelNavigationInProgress()

        await Promise.resolve()

        expect(isResolved).toBe(false)
      })
    })
  })
})

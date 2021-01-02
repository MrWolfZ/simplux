import {
  clearAllSimpluxMocks,
  mockEffect,
  mockMutation,
  mockSelector,
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
  routeName3,
  routerStateWithRoute1,
  routerStateWithRoute1AndChild1,
  routerStateWithRoute1AndChild1AndChild2,
  routerStateWithTwoRoutes,
  routerStateWithTwoRoutesAndOneChild,
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
    mockMutation(_module.activateRoutes, jest.fn())
    mockMutation(_module.incrementNavigationSemaphore, jest.fn())
    mockMutation(_module.decrementNavigationSemaphore, jest.fn())
    mockEffect(
      _module.createNavigationCancellationPromise,
      jest.fn().mockReturnValue(
        new Promise<void>(() => {}),
      ),
    )

    mockEffect(_module.cancelNavigationInProgress, jest.fn())
  })

  afterEach(clearAllSimpluxMocks)

  it('starts with an empty state', () => {
    expect(_module.state()).toEqual(emptyRouterState)
  })

  describe('mutations', () => {
    describe(_module.addRoute, () => {
      it('allows adding route', () => {
        const updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )

        expect(updatedState).toEqual(routerStateWithRoute1)
      })

      it('allows adding multiple routes', () => {
        let updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )

        updatedState = _module.addRoute.withState(updatedState, routeName2)

        expect(updatedState).toEqual(routerStateWithTwoRoutes)
      })

      it('ignores same route name', () => {
        const updatedState = _module.addRoute.withState(
          emptyRouterState,
          routeName1,
        )

        const updatedState2 = _module.addRoute.withState(
          updatedState,
          routeName2,
        )

        const updatedState3 = _module.addRoute.withState(
          updatedState2,
          routeName1,
        )

        expect(updatedState3).toBe(updatedState2)
      })

      it('adds route with same name as a child route', () => {
        const updatedState = _module.addRoute.withState(
          routerStateWithRoute1AndChild1,
          routeName2,
        )

        expect(updatedState).not.toBe(routerStateWithRoute1AndChild1)
      })
    })

    describe(_module.addChildRoute, () => {
      it('allows adding child route', () => {
        const updatedState = _module.addChildRoute.withState(
          routerStateWithRoute1,
          1,
          routeName2,
        )

        expect(updatedState).toEqual(routerStateWithRoute1AndChild1)
      })

      it('allows adding multiple child routes', () => {
        let updatedState = _module.addChildRoute.withState(
          routerStateWithRoute1,
          1,
          routeName2,
        )

        updatedState = _module.addChildRoute.withState(
          updatedState,
          1,
          routeName3,
        )

        expect(updatedState).toEqual(routerStateWithRoute1AndChild1AndChild2)
      })

      it('ignores same route name for the same parent id', () => {
        const updatedState = _module.addChildRoute.withState(
          routerStateWithRoute1,
          1,
          routeName2,
        )

        const updatedState2 = _module.addChildRoute.withState(
          updatedState,
          1,
          routeName3,
        )

        const updatedState3 = _module.addChildRoute.withState(
          updatedState2,
          1,
          routeName2,
        )

        expect(updatedState3).toBe(updatedState2)
      })

      it('allows adding same name for different parent route id', () => {
        const updatedState = _module.addChildRoute.withState(
          routerStateWithTwoRoutes,
          1,
          routeName2,
        )

        const updatedState2 = _module.addChildRoute.withState(
          updatedState,
          1,
          routeName3,
        )

        const updatedState3 = _module.addChildRoute.withState(
          updatedState2,
          2,
          routeName2,
        )

        expect(updatedState3).not.toBe(updatedState2)
      })
    })

    describe(_module.activateRoutes, () => {
      it('marks the route as active', () => {
        const updatedState = _module.activateRoutes.withState(
          routerStateWithRoute1,
          [1],
          {},
        )

        expect(updatedState.activeRouteIds).toBe(1)
      })

      it('marks multiple routes as active', () => {
        const updatedState = _module.activateRoutes.withState(
          routerStateWithRoute1AndChild1,
          [1, 2],
          {},
        )

        expect(updatedState.activeRouteIds).toEqual([1, 2])
      })

      it('sets the parameter values', () => {
        const parameterValues = { param: 'value' }
        const updatedState = _module.activateRoutes.withState(
          routerStateWithRoute1,
          [1],
          parameterValues,
        )

        expect(updatedState.activeRouteParameterValues).toBe(parameterValues)
      })

      it('overwrites the active route ID', () => {
        const stateWithActiveRoute: _RouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteIds: 2,
        }

        const updatedState = _module.activateRoutes.withState(
          stateWithActiveRoute,
          [1],
          {},
        )

        expect(updatedState.activeRouteIds).toBe(1)
      })

      it('overwrites the active parameters', () => {
        const stateWithActiveRoute: _RouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteIds: 2,
          activeRouteParameterValues: { param: 'value' },
        }

        const newParameterValues = { otherParam: 'newValue' }

        const updatedState = _module.activateRoutes.withState(
          stateWithActiveRoute,
          [1],
          newParameterValues,
        )

        expect(updatedState.activeRouteParameterValues).toEqual(
          newParameterValues,
        )
      })

      it('updates the parameter values if the route was already active', () => {
        const stateWithActiveRoute: _RouterState = {
          ...routerStateWithRoute1,
          activeRouteIds: 1,
          activeRouteParameterValues: { param: 'value' },
        }

        const newParameterValues = { otherParam: 'newValue' }

        const updatedState = _module.activateRoutes.withState(
          stateWithActiveRoute,
          [1],
          newParameterValues,
        )

        expect(updatedState.activeRouteParameterValues).toEqual(
          newParameterValues,
        )
      })
    })

    describe(_module.incrementNavigationSemaphore, () => {
      it('increments the semaphore', () => {
        const updatedState = _module.incrementNavigationSemaphore.withState(
          emptyRouterState,
        )

        expect(updatedState.navigationSemaphore).toBe(1)
      })
    })

    describe(_module.decrementNavigationSemaphore, () => {
      it('decrements the semaphore', () => {
        const updatedState = _module.decrementNavigationSemaphore.withState({
          ...emptyRouterState,
          navigationSemaphore: 1,
        })

        expect(updatedState.navigationSemaphore).toBe(0)
      })
    })
  })

  describe('selectors', () => {
    describe(_module.anyRouteIsActive, () => {
      it('returns true for an active route', () => {
        const state: _RouterState = {
          ...routerStateWithTwoRoutes,
          activeRouteIds: 1,
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
          navigationSemaphore: 1,
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
        activeRouteIds: 1,
        activeRouteParameterValues: {},
      }

      it('returns true for an active route', () => {
        const isActive = _module.routeIsActive.withState(
          stateWithActiveRoute,
          1,
        )
        expect(isActive).toBe(true)
      })

      it('returns true for an active parent route', () => {
        const state: _RouterState = {
          ...routerStateWithTwoRoutesAndOneChild,
          activeRouteIds: [1, 2],
          activeRouteParameterValues: {},
        }

        const isActive = _module.routeIsActive.withState(state, 1)

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
        activeRouteIds: 1,
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

    describe(_module.parentRouteId, () => {
      it('returns parent route id for route with parent', () => {
        const parentId = _module.parentRouteId.withState(
          routerStateWithRoute1AndChild1,
          2,
        )

        expect(parentId).toBe(1)
      })

      it('returns undefined for route without parent', () => {
        const parentId = _module.parentRouteId.withState(
          routerStateWithTwoRoutes,
          2,
        )

        expect(parentId).toBe(undefined)
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

      it('returns the same id for same route name', () => {
        mockMutation(
          _module.addRoute,
          jest
            .fn()
            .mockReturnValueOnce(routerStateWithRoute1)
            .mockReturnValueOnce(routerStateWithTwoRoutes)
            .mockReturnValueOnce(routerStateWithTwoRoutes),
        )

        const routeId1 = _module.registerRoute(routeName1)

        const routeId2 = _module.registerRoute(routeName2)

        const routeId3 = _module.registerRoute(routeName1)

        expect(routeId1).toEqual(1)
        expect(routeId2).toEqual(2)
        expect(routeId3).toEqual(routeId1)
      })

      it('stores the onNavigateTo function', () => {
        mockMutation(_module.addRoute, () => routerStateWithRoute1)
        const [setInterceptorMock] = mockEffect(
          _module.setOnNavigateToInterceptor,
          jest.fn(),
        )

        const onNavigateTo = jest.fn()
        _module.registerRoute(routeName1, { onNavigateTo })

        expect(setInterceptorMock).toHaveBeenCalledWith(1, onNavigateTo)
      })

      it('overwrites the onNavigateTo function for the same name', () => {
        mockMutation(_module.addRoute, () => routerStateWithRoute1)
        const [setInterceptorMock] = mockEffect(
          _module.setOnNavigateToInterceptor,
          jest.fn(),
        )

        const onNavigateTo1 = jest.fn()
        const onNavigateTo2 = jest.fn()
        _module.registerRoute(routeName1, { onNavigateTo: onNavigateTo1 })
        _module.registerRoute(routeName1, { onNavigateTo: onNavigateTo2 })

        expect(setInterceptorMock).toHaveBeenCalledWith(1, onNavigateTo1)
        expect(setInterceptorMock).toHaveBeenCalledWith(1, onNavigateTo2)
      })
    })

    describe(_module.registerChildRoute, () => {
      it('allows registering child route', () => {
        mockMutation(
          _module.addChildRoute,
          () => routerStateWithRoute1AndChild1,
        )

        const routeId = _module.registerChildRoute(1, routeName2)
        expect(routeId).toEqual(2)
      })

      it('allows registering multiple child routes', () => {
        mockMutation(
          _module.addChildRoute,
          jest
            .fn()
            .mockReturnValueOnce(routerStateWithRoute1AndChild1)
            .mockReturnValueOnce(routerStateWithRoute1AndChild1AndChild2),
        )

        const routeId1 = _module.registerChildRoute(1, routeName2)
        const routeId2 = _module.registerChildRoute(1, routeName3, {})

        expect(routeId1).toEqual(2)
        expect(routeId2).toEqual(3)
      })

      it('returns the same id for same route name', () => {
        mockMutation(
          _module.addChildRoute,
          jest
            .fn()
            .mockReturnValueOnce(routerStateWithRoute1AndChild1)
            .mockReturnValueOnce(routerStateWithRoute1AndChild1AndChild2)
            .mockReturnValueOnce(routerStateWithRoute1AndChild1AndChild2),
        )

        const routeId1 = _module.registerChildRoute(1, routeName2)

        const routeId2 = _module.registerChildRoute(1, routeName3)

        const routeId3 = _module.registerChildRoute(1, routeName2)

        expect(routeId1).toEqual(2)
        expect(routeId2).toEqual(3)
        expect(routeId3).toEqual(routeId1)
      })

      it('stores the onNavigateTo function', () => {
        mockMutation(
          _module.addChildRoute,
          () => routerStateWithRoute1AndChild1,
        )

        const [setInterceptorMock] = mockEffect(
          _module.setOnNavigateToInterceptor,
          jest.fn(),
        )

        const onNavigateTo = jest.fn()
        _module.registerChildRoute(1, routeName2, { onNavigateTo })

        expect(setInterceptorMock).toHaveBeenCalledWith(2, onNavigateTo)
      })

      it('overwrites the onNavigateTo function for the same name', () => {
        mockMutation(
          _module.addChildRoute,
          () => routerStateWithRoute1AndChild1,
        )

        const [setInterceptorMock] = mockEffect(
          _module.setOnNavigateToInterceptor,
          jest.fn(),
        )

        const onNavigateTo1 = jest.fn()
        const onNavigateTo2 = jest.fn()

        _module.registerChildRoute(1, routeName2, {
          onNavigateTo: onNavigateTo1,
        })

        _module.registerChildRoute(1, routeName2, {
          onNavigateTo: onNavigateTo2,
        })

        expect(setInterceptorMock).toHaveBeenCalledWith(2, onNavigateTo1)
        expect(setInterceptorMock).toHaveBeenCalledWith(2, onNavigateTo2)
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
        const [mock] = mockMutation(_module.activateRoutes, jest.fn())

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

        expect(mock).toHaveBeenCalledWith([1], parameterValues)
      })

      it('increments navigation semaphore at the start of the navigation', async () => {
        const [mock] = mockMutation(
          _module.incrementNavigationSemaphore,
          jest.fn(),
        )

        let resolve = () => {}
        const onNavToPromise = new Promise<void>((r) => (resolve = r))
        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => onNavToPromise,
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        expect(mock).toHaveBeenCalled()

        resolve()
        await promise
      })

      it('decrements navigation semaphore at the end of the navigation', async () => {
        const [mock] = mockMutation(
          _module.decrementNavigationSemaphore,
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

        expect(mock).toHaveBeenCalled()
      })

      it('cancels navigation in progress', async () => {
        const [mock] = mockEffect(_module.cancelNavigationInProgress, jest.fn())

        const parameterValues = { param: 'value' }
        await _module.navigateToRoute(1, parameterValues)

        expect(mock).toHaveBeenCalled()
      })

      it('does not activate the route if navigation is cancelled', async () => {
        const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
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

      it('decrements navigation semaphore if navigation is cancelled', async () => {
        const [cancelPromiseMock] = mockEffect(
          _module.createNavigationCancellationPromise,
          jest.fn(),
        )

        const [decrementSemaphoreMock] = mockMutation(
          _module.decrementNavigationSemaphore,
          jest.fn(),
        )

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => new Promise<void>(() => {}),
        }))

        let cancelNav = () => {}
        const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        cancelPromiseMock.mockReturnValueOnce(cancelPromise)

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        cancelNav()

        await expect(promise).resolves.toBe(NAVIGATION_CANCELLED)

        expect(decrementSemaphoreMock).toHaveBeenCalled()
      })

      it('clears cancellation callback at the end of the navigation', async () => {
        mockMutation(_module.activateRoutes, jest.fn())
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
        const [decrementSemaphoreMock] = mockMutation(
          _module.decrementNavigationSemaphore,
          jest.fn(),
        )

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

        expect(decrementSemaphoreMock).toHaveBeenCalled()
      })

      it('cancels navigation if onNavigateTo redirects navigation synchronously', async () => {
        const [decrementSemaphoreMock] = mockMutation(
          _module.decrementNavigationSemaphore,
          jest.fn(),
        )

        const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
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
        expect(decrementSemaphoreMock).toHaveBeenCalled()
      })

      it('cancels navigation if onNavigateTo redirects navigation asynchronously', async () => {
        const [decrementSemaphoreMock] = mockMutation(
          _module.decrementNavigationSemaphore,
          jest.fn(),
        )

        const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
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
        expect(decrementSemaphoreMock).toHaveBeenCalled()
      })

      it('rejects the navigation if onNavigateTo throws', async () => {
        const [decrementSemaphoreMock] = mockMutation(
          _module.decrementNavigationSemaphore,
          jest.fn(),
        )

        const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => {
            throw new Error()
          },
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        await expect(promise).rejects.toBeDefined()
        expect(activateMock).not.toHaveBeenCalled()
        expect(decrementSemaphoreMock).toHaveBeenCalled()
      })

      it('rejects the navigation if onNavigateTo rejects', async () => {
        const [decrementSemaphoreMock] = mockMutation(
          _module.decrementNavigationSemaphore,
          jest.fn(),
        )

        const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())

        mockEffect(_module.getOnNavigateToInterceptors, () => ({
          1: () => Promise.reject(new Error()),
        }))

        const parameterValues = { param: 'value' }
        const promise = _module.navigateToRoute(1, parameterValues)

        await expect(promise).rejects.toBeDefined()
        expect(activateMock).not.toHaveBeenCalled()
        expect(decrementSemaphoreMock).toHaveBeenCalled()
      })

      describe('with child route', () => {
        beforeEach(() =>
          mockSelector(_module.parentRouteId, jest.fn().mockReturnValueOnce(1)),
        )

        it('calls the onNavigateTo interceptors for the parent and child routes', async () => {
          const parentInterceptor = jest.fn().mockResolvedValueOnce(undefined)
          const childInterceptor = jest.fn().mockResolvedValueOnce(undefined)
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: parentInterceptor,
            2: childInterceptor,
          }))

          const parentParameterValues = { parent: 'parent' }
          const childParameterValues = { child: 'child' }
          const parameterValues = {
            ...parentParameterValues,
            ...childParameterValues,
          }

          await _module.navigateToRoute(2, parameterValues)

          expect(parentInterceptor).toHaveBeenCalledWith(
            parameterValues,
            expect.anything(),
          )

          expect(childInterceptor).toHaveBeenCalledWith(
            parameterValues,
            expect.anything(),
          )
        })

        it('calls the onNavigateTo interceptors for the deeply nested routes', async () => {
          mockSelector(
            _module.parentRouteId,
            jest.fn().mockReturnValueOnce(2).mockReturnValueOnce(1),
          )

          const parentInterceptor = jest.fn().mockResolvedValueOnce(undefined)
          const child1Interceptor = jest.fn().mockResolvedValueOnce(undefined)
          const child2Interceptor = jest.fn().mockResolvedValueOnce(undefined)
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: parentInterceptor,
            2: child1Interceptor,
            3: child2Interceptor,
          }))

          const parentParameterValues = { parent: 'parent' }
          const child1ParameterValues = { child1: 'child1' }
          const child2ParameterValues = { child2: 'child2' }
          const parameterValues = {
            ...parentParameterValues,
            ...child1ParameterValues,
            ...child2ParameterValues,
          }

          await _module.navigateToRoute(3, parameterValues)

          expect(parentInterceptor).toHaveBeenCalledWith(
            parameterValues,
            expect.anything(),
          )

          expect(child1Interceptor).toHaveBeenCalledWith(
            parameterValues,
            expect.anything(),
          )

          expect(child2Interceptor).toHaveBeenCalledWith(
            parameterValues,
            expect.anything(),
          )
        })

        it('calls the onNavigateTo interceptors in the correct order', async () => {
          mockSelector(
            _module.parentRouteId,
            jest.fn().mockReturnValueOnce(2).mockReturnValueOnce(1),
          )

          const [mock] = mockMutation(_module.activateRoutes, jest.fn())

          let resolve1 = () => {}
          let resolve2 = () => {}
          let resolve3 = () => {}
          const onNavToPromise1 = new Promise<void>((r) => (resolve1 = r))
          const onNavToPromise2 = new Promise<void>((r) => (resolve2 = r))
          const onNavToPromise3 = new Promise<void>((r) => (resolve3 = r))
          const onNavToMock1 = jest.fn().mockReturnValueOnce(onNavToPromise1)
          const onNavToMock2 = jest.fn().mockReturnValueOnce(onNavToPromise2)
          const onNavToMock3 = jest.fn().mockReturnValueOnce(onNavToPromise3)
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: onNavToMock1,
            2: onNavToMock2,
            3: onNavToMock3,
          }))

          const parentParameterValues = { parent: 'parent' }
          const child1ParameterValues = { child1: 'child1' }
          const child2ParameterValues = { child2: 'child2' }
          const parameterValues = {
            ...parentParameterValues,
            ...child1ParameterValues,
            ...child2ParameterValues,
          }

          const promise = _module.navigateToRoute(3, parameterValues)

          expect(mock).not.toHaveBeenCalled()
          expect(onNavToMock1).toHaveBeenCalled()
          expect(onNavToMock2).not.toHaveBeenCalled()
          expect(onNavToMock3).not.toHaveBeenCalled()

          resolve1()
          await Promise.resolve()

          expect(mock).not.toHaveBeenCalled()
          expect(onNavToMock1).toHaveBeenCalled()
          expect(onNavToMock2).toHaveBeenCalled()
          expect(onNavToMock3).not.toHaveBeenCalled()

          resolve2()
          await Promise.resolve()

          expect(mock).not.toHaveBeenCalled()
          expect(onNavToMock1).toHaveBeenCalled()
          expect(onNavToMock2).toHaveBeenCalled()
          expect(onNavToMock3).toHaveBeenCalled()

          resolve3()
          await promise

          expect(mock).toHaveBeenCalledWith([3, 2, 1], parameterValues)
        })

        // tslint:disable-next-line: max-line-length
        it('calls the onNavigateTo interceptors for the parent and child routes without parameters', async () => {
          const parentInterceptor = jest.fn().mockResolvedValueOnce(undefined)
          const childInterceptor = jest.fn().mockResolvedValueOnce(undefined)
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: parentInterceptor,
            2: childInterceptor,
          }))

          await _module.navigateToRoute(2)

          expect(parentInterceptor).toHaveBeenCalledWith({}, expect.anything())
          expect(childInterceptor).toHaveBeenCalledWith({}, expect.anything())
        })

        it('activates the child and parent routes at the end of the navigation', async () => {
          const [mock] = mockMutation(_module.activateRoutes, jest.fn())

          let resolve1 = () => {}
          let resolve2 = () => {}
          const onNavToPromise1 = new Promise<void>((r) => (resolve1 = r))
          const onNavToPromise2 = new Promise<void>((r) => (resolve2 = r))
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => onNavToPromise1,
            2: () => onNavToPromise2,
          }))

          const parentParameterValues = { parent: 'parent' }
          const childParameterValues = { child: 'child' }
          const parameterValues = {
            ...parentParameterValues,
            ...childParameterValues,
          }

          const promise = _module.navigateToRoute(2, parameterValues)

          expect(mock).not.toHaveBeenCalled()

          resolve1()

          expect(mock).not.toHaveBeenCalled()

          resolve2()
          await promise

          expect(mock).toHaveBeenCalledWith([2, 1], parameterValues)
        })

        it('activates deeply nested routes at the end of the navigation', async () => {
          mockSelector(
            _module.parentRouteId,
            jest.fn().mockReturnValueOnce(2).mockReturnValueOnce(1),
          )

          const [mock] = mockMutation(_module.activateRoutes, jest.fn())

          let resolve1 = () => {}
          let resolve2 = () => {}
          let resolve3 = () => {}
          const onNavToPromise1 = new Promise<void>((r) => (resolve1 = r))
          const onNavToPromise2 = new Promise<void>((r) => (resolve2 = r))
          const onNavToPromise3 = new Promise<void>((r) => (resolve3 = r))
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => onNavToPromise1,
            2: () => onNavToPromise2,
            3: () => onNavToPromise3,
          }))

          const parentParameterValues = { parent: 'parent' }
          const child1ParameterValues = { child1: 'child1' }
          const child2ParameterValues = { child2: 'child2' }
          const parameterValues = {
            ...parentParameterValues,
            ...child1ParameterValues,
            ...child2ParameterValues,
          }

          const promise = _module.navigateToRoute(3, parameterValues)

          expect(mock).not.toHaveBeenCalled()

          resolve1()

          expect(mock).not.toHaveBeenCalled()

          resolve2()

          expect(mock).not.toHaveBeenCalled()

          resolve3()
          await promise

          expect(mock).toHaveBeenCalledWith([3, 2, 1], parameterValues)
        })

        it('does not activate the route if navigation is cancelled', async () => {
          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
          const [mock] = mockEffect(
            _module.createNavigationCancellationPromise,
            jest.fn(),
          )

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => new Promise<void>(() => {}),
            2: () => new Promise<void>(() => {}),
          }))

          let cancelNav = () => {}
          const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
            (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
          )

          mock.mockReturnValueOnce(cancelPromise)

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          cancelNav()
          await promise

          expect(activateMock).not.toHaveBeenCalled()
        })

        it('signals whether navigation is targeting child route', async () => {
          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: (_: unknown, extras: OnNavigateToExtras) => {
              expect(extras.navigationIsToChildRoute).toBe(true)
            },
            2: (_: unknown, extras: OnNavigateToExtras) => {
              expect(extras.navigationIsToChildRoute).toBe(false)
            },
          }))

          await _module.navigateToRoute(2)
        })

        it('signals whether navigation is targeting deeply nested child route', async () => {
          mockSelector(
            _module.parentRouteId,
            jest.fn().mockReturnValueOnce(2).mockReturnValueOnce(1),
          )

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: (_: unknown, extras: OnNavigateToExtras) => {
              expect(extras.navigationIsToChildRoute).toBe(true)
            },
            2: (_: unknown, extras: OnNavigateToExtras) => {
              expect(extras.navigationIsToChildRoute).toBe(true)
            },
            3: (_: unknown, extras: OnNavigateToExtras) => {
              expect(extras.navigationIsToChildRoute).toBe(false)
            },
          }))

          await _module.navigateToRoute(3)
        })

        // tslint:disable-next-line: max-line-length
        it('notifies the onNavigateTo interceptor for the child route of cancellation', async () => {
          let childCancellationPromise = new Promise<
            typeof NAVIGATION_CANCELLED
          >(() => {})

          const [createCancelPromiseMock] = mockEffect(
            _module.createNavigationCancellationPromise,
            jest.fn(),
          )

          let cancelNav = () => {}
          const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
            (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
          )

          createCancelPromiseMock.mockReturnValueOnce(cancelPromise)

          const childInterceptor = jest
            .fn<Promise<void>, [any, OnNavigateToExtras]>()
            .mockImplementationOnce((_, { cancelled }) => {
              childCancellationPromise = cancelled
              return new Promise<void>(() => {})
            })

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => Promise.resolve(),
            2: childInterceptor,
          }))

          const promise = _module.navigateToRoute(2)

          await Promise.resolve()

          cancelNav()

          await expect(childCancellationPromise).resolves.toBe(
            NAVIGATION_CANCELLED,
          )

          await promise
        })

        // tslint:disable-next-line: max-line-length
        it('notifies the onNavigateTo interceptor for the parent route of cancellation', async () => {
          let parentCancellationPromise = new Promise<
            typeof NAVIGATION_CANCELLED
          >(() => {})

          const [createCancelPromiseMock] = mockEffect(
            _module.createNavigationCancellationPromise,
            jest.fn(),
          )

          let cancelNav = () => {}
          const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
            (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
          )

          createCancelPromiseMock.mockReturnValueOnce(cancelPromise)

          const parentInterceptor = jest
            .fn<Promise<void>, [any, OnNavigateToExtras]>()
            .mockImplementationOnce((_, { cancelled }) => {
              parentCancellationPromise = cancelled
              return new Promise<void>(() => {})
            })

          const childInterceptor = jest
            .fn<Promise<void>, [any, OnNavigateToExtras]>()
            .mockImplementationOnce(() => Promise.resolve())

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: parentInterceptor,
            2: childInterceptor,
          }))

          const promise = _module.navigateToRoute(1)

          cancelNav()

          await expect(parentCancellationPromise).resolves.toBe(
            NAVIGATION_CANCELLED,
          )

          await promise
        })

        it('cancels navigation if child onNavigateTo wants to cancel navigation', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const parentInterceptor = jest
            .fn<Promise<void>, [any, OnNavigateToExtras]>()
            .mockImplementationOnce(() => Promise.resolve())

          const childInterceptor = jest
            .fn<
              Promise<typeof NAVIGATION_CANCELLED>,
              [any, OnNavigateToExtras]
            >()
            .mockImplementationOnce((_, { cancelNavigation }) => {
              return Promise.resolve(cancelNavigation)
            })

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: parentInterceptor,
            2: childInterceptor,
          }))

          const promise = _module.navigateToRoute(2)

          await expect(promise).resolves.toBe(NAVIGATION_CANCELLED)
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        it('cancels navigation if parent onNavigateTo wants to cancel navigation', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const parentInterceptor = jest
            .fn<
              Promise<typeof NAVIGATION_CANCELLED>,
              [any, OnNavigateToExtras]
            >()
            .mockImplementationOnce((_, { cancelNavigation }) => {
              return Promise.resolve(cancelNavigation)
            })

          const childInterceptor = jest
            .fn<Promise<void>, [any, OnNavigateToExtras]>()
            .mockImplementationOnce(() => Promise.resolve())

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: parentInterceptor,
            2: childInterceptor,
          }))

          const promise = _module.navigateToRoute(2)

          await expect(promise).resolves.toBe(NAVIGATION_CANCELLED)
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        // tslint:disable-next-line: max-line-length
        it('cancels navigation if child onNavigateTo redirects navigation synchronously', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
          const [mock] = mockEffect(
            _module.createNavigationCancellationPromise,
            jest.fn(),
          )

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => Promise.resolve(),
            2: () => {
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
          const promise = _module.navigateToRoute(2, parameterValues)

          await promise

          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        // tslint:disable-next-line: max-line-length
        it('cancels navigation if parent onNavigateTo redirects navigation synchronously', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
          const [mock] = mockEffect(
            _module.createNavigationCancellationPromise,
            jest.fn(),
          )

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => {
              cancelNav()
              return NAVIGATION_FINISHED
            },
            2: () => Promise.resolve(),
          }))

          let cancelNav = () => {}
          const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
            (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
          )

          mock.mockReturnValueOnce(cancelPromise)

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          await promise

          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        // tslint:disable-next-line: max-line-length
        it('cancels navigation if child onNavigateTo redirects navigation asynchronously', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
          const [mock] = mockEffect(
            _module.createNavigationCancellationPromise,
            jest.fn(),
          )

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => Promise.resolve(),
            2: async () => {
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
          const promise = _module.navigateToRoute(2, parameterValues)

          await promise

          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        // tslint:disable-next-line: max-line-length
        it('cancels navigation if parent onNavigateTo redirects navigation asynchronously', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())
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
            2: () => Promise.resolve(),
          }))

          let cancelNav = () => {}
          const cancelPromise = new Promise<typeof NAVIGATION_CANCELLED>(
            (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
          )

          mock.mockReturnValueOnce(cancelPromise)

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          await promise

          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        it('rejects the navigation if child onNavigateTo throws', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => Promise.resolve(),
            2: () => {
              throw new Error()
            },
          }))

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          await expect(promise).rejects.toBeDefined()
          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        it('rejects the navigation if parent onNavigateTo throws', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => {
              throw new Error()
            },
            2: () => Promise.resolve(),
          }))

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          await expect(promise).rejects.toBeDefined()
          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        it('rejects the navigation if child onNavigateTo rejects', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => Promise.resolve(),
            2: () => Promise.reject(new Error()),
          }))

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          await expect(promise).rejects.toBeDefined()
          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })

        it('rejects the navigation if parent onNavigateTo rejects', async () => {
          const [decrementSemaphoreMock] = mockMutation(
            _module.decrementNavigationSemaphore,
            jest.fn(),
          )

          const [activateMock] = mockMutation(_module.activateRoutes, jest.fn())

          mockEffect(_module.getOnNavigateToInterceptors, () => ({
            1: () => Promise.reject(new Error()),
            2: () => Promise.resolve(),
          }))

          const parameterValues = { param: 'value' }
          const promise = _module.navigateToRoute(2, parameterValues)

          await expect(promise).rejects.toBeDefined()
          expect(activateMock).not.toHaveBeenCalled()
          expect(decrementSemaphoreMock).toHaveBeenCalled()
        })
      })
    })

    describe('onNavigateTo interceptors', () => {
      afterEach(_module.clearOnNavigateToInterceptors)

      it('can be added', () => {
        const interceptor = jest.fn()
        _module.setOnNavigateToInterceptor(1, interceptor)

        const interceptors = _module.getOnNavigateToInterceptors()

        expect(interceptors).toEqual({ 1: interceptor })
      })

      it('can be cleared', () => {
        const interceptor = jest.fn()
        _module.setOnNavigateToInterceptor(1, interceptor)

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

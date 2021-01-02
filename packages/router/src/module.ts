import {
  createEffects,
  createMutations,
  createSelectors,
  createSimpluxModule,
  Immutable,
} from '@simplux/core'
import type { SimpluxRouteConfiguration } from './route.js'

/**
 * The name of a simplux route.
 *
 * @internal
 */
export type _RouteName = string

/**
 * The ID of a simplux route.
 *
 * @internal
 */
export type _RouteId = number

/**
 * A marker symbol used when navigations finish successfully.
 *
 * @public
 */
// should be a symbol, but TypeScript has type inference issues
// in async functions with unique symbols, so we use a plain
// string instead as a workaround
export const NAVIGATION_FINISHED = '[NAVIGATION_FINISHED]'

/**
 * A marker symbol used when navigations are cancelled.
 *
 * @public
 */
// should be a symbol, but TypeScript has type inference issues
// in async functions with unique symbols, so we use a plain
// string instead as a workaround
export const NAVIGATION_CANCELLED = '[NAVIGATION_CANCELLED]'

/**
 * Base type for navigation parameters.
 *
 * @public
 */
export type NavigationParameters = Readonly<Record<string, any>>

/**
 * The result of a route navigation.
 *
 * @public
 */
export type NavigationResult = Promise<
  typeof NAVIGATION_FINISHED | typeof NAVIGATION_CANCELLED
>

/**
 * Extra utility arguments for an `onNavigateTo` callback.
 *
 * @public
 */
export interface OnNavigateToExtras {
  /**
   * A promise that resolves when the navigation is cancelled
   * (e.g. because a new navigation has started while this
   * function was running).
   */
  readonly navigationWasCancelled: Promise<typeof NAVIGATION_CANCELLED>

  /**
   * This object can be returned to cancel the navigation.
   */
  readonly cancelNavigation: typeof NAVIGATION_CANCELLED

  /**
   * Indicates whether the current navigation is targeting a
   * child route of this route. Useful for implementing a
   * redirect to a default child route.
   */
  readonly navigationIsToChildRoute: boolean
}

/**
 * A function to be called when navigating to a route.
 *
 * @param parameters - the parameters for the navigation (if any).
 * @param extras - additional arguments
 *
 * @returns nothing or a promise to wait for during navigation
 *
 * @public
 */
export type OnNavigateTo<TParameters = NavigationParameters> = (
  parameters: Immutable<TParameters>,
  extras: OnNavigateToExtras,
) =>
  | void
  | typeof NAVIGATION_FINISHED
  | typeof NAVIGATION_CANCELLED
  | Promise<void | typeof NAVIGATION_FINISHED | typeof NAVIGATION_CANCELLED>

/**
 * The state of a simplux route.
 *
 * @internal
 */
export interface _RouteState {
  readonly name: _RouteName
  readonly parentRouteId: _RouteId | undefined
}

/**
 * The state of the simplux router.
 *
 * @internal
 */
export interface _RouterState {
  /**
   * All registered routes.
   */
  readonly routes: _RouteState[]

  /**
   * The id of the currently active route (or `undefined` if
   * no route is currently active, e.g. after creating the
   * router).
   */
  activeRouteIds: _RouteId | _RouteId[] | undefined

  /**
   * The parameter values for the currently active route. Will
   * be `{}` while no route is active.
   */
  activeRouteParameterValues: NavigationParameters

  /**
   * Indicates whether a navigation is currently in progress.
   */
  navigationSemaphore: number
}

const initialState: _RouterState = {
  routes: [],
  activeRouteIds: undefined,
  activeRouteParameterValues: {},
  navigationSemaphore: 0,
}

const routerModule = createSimpluxModule('router', initialState)

const mutations = createMutations(routerModule, {
  addRoute: ({ routes }, name: _RouteName) => {
    if (routes.some((r) => r.name === name && r.parentRouteId === undefined)) {
      return
    }

    routes.push({
      name,
      parentRouteId: undefined,
    })
  },

  addChildRoute: ({ routes }, parentRouteId: _RouteId, name: _RouteName) => {
    if (
      routes.some((r) => r.name === name && r.parentRouteId === parentRouteId)
    ) {
      return
    }

    routes.push({
      name,
      parentRouteId,
    })
  },

  activateRoutes: (
    state,
    routeIds: _RouteId[],
    parameters: NavigationParameters,
  ) => {
    state.activeRouteIds = routeIds.length === 1 ? routeIds[0] : routeIds
    state.activeRouteParameterValues = parameters
  },

  incrementNavigationSemaphore: (state) => {
    state.navigationSemaphore += 1
  },

  decrementNavigationSemaphore: (state) => {
    state.navigationSemaphore -= 1
  },
})

const selectors = createSelectors(routerModule, {
  state: (s) => s,

  anyRouteIsActive: ({ activeRouteIds }) => !!activeRouteIds,

  navigationIsInProgress: ({ navigationSemaphore }) => navigationSemaphore > 0,

  routeIsActive: ({ activeRouteIds }, routeId: _RouteId) =>
    activeRouteIds === routeId ||
    (Array.isArray(activeRouteIds) && activeRouteIds.includes(routeId)),

  routeParameterValues: (state, routeId: _RouteId) => {
    const { routes, activeRouteParameterValues } = state
    const route = routes[routeId - 1]
    const isActive = selectors.routeIsActive.withState(state, routeId)

    if (process.env.NODE_ENV !== 'production') {
      if (!route) {
        throw new Error(`route with ID ${routeId} does not exist`)
      }

      if (!isActive) {
        throw new Error(`route ${route.name} with ID ${routeId} is not active`)
      }
    }

    if (!route || !isActive) {
      return {}
    }

    return activeRouteParameterValues
  },

  parentRouteId: ({ routes }, routeId: _RouteId) =>
    routes[routeId - 1]?.parentRouteId,
})

type OnNavigateToInterceptors = {
  [routeId in _RouteId]?: OnNavigateTo
}

let onNavigateToInterceptors: OnNavigateToInterceptors = {}
let cancelNavigationInProgress: (() => void) | undefined

const effects = createEffects({
  registerRoute: (
    name: _RouteName,
    configuration?: SimpluxRouteConfiguration<any>,
  ): _RouteId => {
    const updatedState = mutations.addRoute(name)
    const routeId = updatedState.routes.findIndex((r) => r.name === name) + 1

    if (configuration) {
      if (configuration.onNavigateTo) {
        effects.setOnNavigateToInterceptor(routeId, configuration.onNavigateTo)
      }
    }

    return routeId
  },

  registerChildRoute: (
    parentRouteId: _RouteId,
    name: _RouteName,
    configuration?: SimpluxRouteConfiguration<any>,
  ): _RouteId => {
    const updatedState = mutations.addChildRoute(parentRouteId, name)
    const routeId = updatedState.routes.findIndex((r) => r.name === name) + 1

    if (configuration) {
      if (configuration.onNavigateTo) {
        effects.setOnNavigateToInterceptor(routeId, configuration.onNavigateTo)
      }
    }

    return routeId
  },

  navigateToRoute: async (
    targetRouteId: _RouteId,
    parameters?: NavigationParameters,
  ): NavigationResult => {
    effects.cancelNavigationInProgress()

    mutations.incrementNavigationSemaphore()

    const routeIdsToActivate: _RouteId[] = []
    let currentRouteId: _RouteId | undefined = targetRouteId

    while (!!currentRouteId) {
      routeIdsToActivate.push(currentRouteId)
      currentRouteId = selectors.parentRouteId(currentRouteId)
    }

    const interceptors = effects.getOnNavigateToInterceptors()
    const cancellationPromise = effects.createNavigationCancellationPromise()

    const onNavigateTo = async () => {
      for (const routeId of [...routeIdsToActivate].reverse()) {
        const interceptor = interceptors[routeId]

        if (interceptor) {
          const onNavigateToExtras: OnNavigateToExtras = {
            navigationWasCancelled: cancellationPromise,
            cancelNavigation: NAVIGATION_CANCELLED,
            navigationIsToChildRoute: routeId !== targetRouteId,
          }

          const res = await interceptor(parameters || {}, onNavigateToExtras)

          if (res) {
            return res
          }
        }
      }
    }

    try {
      const result = await Promise.race([onNavigateTo(), cancellationPromise])

      if (result === NAVIGATION_CANCELLED || result === NAVIGATION_FINISHED) {
        return NAVIGATION_CANCELLED
      }

      mutations.activateRoutes(routeIdsToActivate, parameters || {})

      return NAVIGATION_FINISHED
    } finally {
      mutations.decrementNavigationSemaphore()
      effects.clearNavigationCancellationCallback()
    }
  },

  createNavigationCancellationPromise: () => {
    return new Promise<typeof NAVIGATION_CANCELLED>((resolve) => {
      cancelNavigationInProgress = () => resolve(NAVIGATION_CANCELLED)
    })
  },

  cancelNavigationInProgress: () => {
    cancelNavigationInProgress?.()
  },

  clearNavigationCancellationCallback: () => {
    cancelNavigationInProgress = undefined
  },

  setOnNavigateToInterceptor: (
    routeId: _RouteId,
    interceptor: OnNavigateTo,
  ) => {
    onNavigateToInterceptors[routeId] = interceptor
  },

  getOnNavigateToInterceptors: () => onNavigateToInterceptors,

  clearOnNavigateToInterceptors: () => {
    onNavigateToInterceptors = {}
  },
})

// tslint:disable-next-line:variable-name (internal export)
export const _module = {
  ...routerModule,
  ...mutations,
  ...selectors,
  ...effects,
}

import {
  createEffects,
  createMutations,
  createSelectors,
  createSimpluxModule,
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
export const NAVIGATION_FINISHED = Symbol('NAVIGATION_FINISHED')

/**
 * A marker symbol used when navigations are cancelled.
 *
 * @public
 */
export const NAVIGATION_CANCELLED = Symbol('NAVIGATION_CANCELLED')

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
  cancelled: Promise<typeof NAVIGATION_CANCELLED>

  /**
   * This object can be returned to cancel the navigation.
   */
  cancelNavigation: typeof NAVIGATION_CANCELLED
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
  parameters: TParameters,
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
  /**
   * The name of the route.
   */
  readonly name: _RouteName
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
  activeRouteId: _RouteId | undefined

  /**
   * The parameter values for the currently active route. Will
   * be `{}` while no route is active.
   */
  activeRouteParameterValues: NavigationParameters

  /**
   * Indicates whether a navigation is currently in progress.
   */
  navigationIsInProgress: boolean
}

const initialState: _RouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
  navigationIsInProgress: false,
}

const routerModule = createSimpluxModule('router', initialState)

const mutations = createMutations(routerModule, {
  addRoute: ({ routes }, name: _RouteName) => {
    if (routes.some((r) => r.name === name)) {
      return
    }

    routes.push({
      name,
    })
  },

  activateRoute: (
    state,
    routeId: _RouteId,
    parameters: NavigationParameters,
  ) => {
    state.activeRouteId = routeId
    state.activeRouteParameterValues = parameters
  },

  setNavigationIsInProgress: (state, navigationIsInProgress: boolean) => {
    state.navigationIsInProgress = navigationIsInProgress
  },
})

const selectors = createSelectors(routerModule, {
  state: (s) => s,

  anyRouteIsActive: ({ activeRouteId }) => !!activeRouteId,

  navigationIsInProgress: ({ navigationIsInProgress }) =>
    navigationIsInProgress,

  routeIsActive: ({ activeRouteId }, routeId: _RouteId) =>
    activeRouteId === routeId,

  routeParameterValues: (
    { routes, activeRouteId, activeRouteParameterValues },
    routeId: _RouteId,
  ) => {
    const route = routes[routeId - 1]

    if (process.env.NODE_ENV !== 'production') {
      if (!route) {
        throw new Error(`route with ID ${routeId} does not exist`)
      }

      if (activeRouteId !== routeId) {
        throw new Error(`route ${route.name} with ID ${routeId} is not active`)
      }
    }

    if (!route || activeRouteId !== routeId) {
      return {}
    }

    return activeRouteParameterValues
  },
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

  navigateToRoute: async (
    routeId: _RouteId,
    parameters?: NavigationParameters,
  ): NavigationResult => {
    effects.cancelNavigationInProgress()

    mutations.setNavigationIsInProgress(true)

    const onNavigateTo = effects.getOnNavigateToInterceptors()[routeId]
    const cancellationPromise = effects.createNavigationCancellationPromise()

    const onNavigateToExtras: OnNavigateToExtras = {
      cancelled: cancellationPromise,
      cancelNavigation: NAVIGATION_CANCELLED,
    }

    const result = await Promise.race([
      onNavigateTo?.(parameters || {}, onNavigateToExtras) || Promise.resolve(),
      cancellationPromise,
    ])

    if (result === NAVIGATION_CANCELLED || result === NAVIGATION_FINISHED) {
      return NAVIGATION_CANCELLED
    }

    mutations.activateRoute(routeId, parameters || {})
    mutations.setNavigationIsInProgress(false)
    effects.clearNavigationCancellationCallback()

    return NAVIGATION_FINISHED
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

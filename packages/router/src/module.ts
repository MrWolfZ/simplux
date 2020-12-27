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
 * @public
 */
export type SimpluxRouteName = string

/**
 * The ID of a simplux route.
 *
 * @public
 */
export type SimpluxRouteId = number

/**
 * Helper type to distinguish navigation parameter values.
 *
 * @public
 */
export type _NavigationParameters = Readonly<Record<string, any>>

/**
 * The result of a route navigation.
 *
 * @public
 */
export type NavigationResult = Promise<void>

/**
 * Arguments for an `onNavigateTo` callback.
 *
 * @public
 */
export interface OnNavigateToArgs<TParameters> {
  /**
   * The parameters for the navigation.
   */
  parameters: TParameters

  /**
   * A promise that resolves when the navigation is cancelled
   * (e.g. because a new navigation has started while this
   * function was running).
   */
  cancelled: Promise<typeof NAVIGATION_CANCELLED>
}

/**
 * A function to be called when navigating to a route.
 *
 * @param args - the arguments for the function.
 *
 * @returns nothing or a promise to wait for during navigation
 *
 * @public
 */
export type OnNavigateTo<TParameters = _NavigationParameters> = (
  args: OnNavigateToArgs<TParameters>,
) => void | Promise<void>

/**
 * A marker symbol used when navigations are cancelled.
 *
 * @public
 */
export const NAVIGATION_CANCELLED = Symbol('NAVIGATION_CANCELLED')

/**
 * The state of a simplux route.
 *
 * @public
 */
export interface SimpluxRouteState {
  /**
   * The name of the route.
   */
  readonly name: SimpluxRouteName
}

/**
 * The state of the simplux router.
 *
 * @public
 */
export interface SimpluxRouterState {
  /**
   * All registered routes.
   */
  readonly routes: SimpluxRouteState[]

  /**
   * The id of the currently active route (or `undefined` if
   * no route is currently active, e.g. after creating the
   * router).
   */
  activeRouteId: SimpluxRouteId | undefined

  /**
   * The parameter values for the currently active route. Will
   * be `{}` while no route is active.
   */
  activeRouteParameterValues: _NavigationParameters

  /**
   * Indicates whether a navigation is currently in progress.
   */
  navigationIsInProgress: boolean
}

const initialState: SimpluxRouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
  navigationIsInProgress: false,
}

const routerModule = createSimpluxModule('router', initialState)

const mutations = createMutations(routerModule, {
  addRoute: ({ routes }, name: SimpluxRouteName) => {
    routes.push({
      name,
    })
  },

  activateRoute: (
    state,
    routeId: SimpluxRouteId,
    parameters: _NavigationParameters,
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

  routeIsActive: ({ activeRouteId }, routeId: SimpluxRouteId) =>
    activeRouteId === routeId,

  routeParameterValues: (
    { routes, activeRouteId, activeRouteParameterValues },
    routeId: SimpluxRouteId,
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
  [routeId in SimpluxRouteId]?: OnNavigateTo
}

let onNavigateToInterceptors: OnNavigateToInterceptors = {}
let cancelNavigationInProgress: (() => void) | undefined

const effects = createEffects({
  registerRoute: (
    name: SimpluxRouteName,
    configuration?: SimpluxRouteConfiguration<any>,
  ): SimpluxRouteId => {
    const updatedState = mutations.addRoute(name)
    const routeId = updatedState.routes.length

    if (configuration) {
      if (configuration.onNavigateTo) {
        effects.addOnNavigateToInterceptor(routeId, configuration.onNavigateTo)
      }
    }

    return routeId
  },

  navigateToRoute: async (
    routeId: SimpluxRouteId,
    parameters?: _NavigationParameters,
  ): NavigationResult => {
    effects.cancelNavigationInProgress()

    mutations.setNavigationIsInProgress(true)

    const onNavigateTo = effects.getOnNavigateToInterceptors()[routeId]
    const cancellationPromise = effects.createNavigationCancellationPromise()

    const onNavigateToArgs: OnNavigateToArgs<_NavigationParameters> = {
      parameters: parameters || {},
      cancelled: cancellationPromise,
    }

    const result = await Promise.race([
      onNavigateTo?.(onNavigateToArgs) || Promise.resolve(),
      cancellationPromise,
    ])

    if (result === NAVIGATION_CANCELLED) {
      return
    }

    mutations.activateRoute(routeId, parameters || {})
    mutations.setNavigationIsInProgress(false)
    effects.clearNavigationCancellationCallback()
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

  addOnNavigateToInterceptor: (
    routeId: SimpluxRouteId,
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

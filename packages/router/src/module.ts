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
export type NavigationResult = void

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
}

const initialState: SimpluxRouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
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
})

const selectors = createSelectors(routerModule, {
  state: (s) => s,

  anyRouteIsActive: ({ activeRouteId }) => !!activeRouteId,

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

const effects = createEffects({
  registerRoute: (
    name: SimpluxRouteName,
    configuration?: SimpluxRouteConfiguration<any>,
  ): SimpluxRouteId => {
    configuration // TODO: use
    const updatedState = mutations.addRoute(name)
    return updatedState.routes.length
  },

  navigateToRoute: (
    routeId: SimpluxRouteId,
    parameters?: _NavigationParameters,
  ): NavigationResult => {
    mutations.activateRoute(routeId, parameters || {})
  },
})

// tslint:disable-next-line:variable-name (internal export)
export const _module = {
  ...routerModule,
  ...mutations,
  ...selectors,
  ...effects,
}

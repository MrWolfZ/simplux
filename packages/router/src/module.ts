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
 * The state of a simplux route.
 *
 * @public
 */
export interface SimpluxRouteState {
  /**
   * The name of the route.
   */
  readonly name: string

  /**
   * The default parameter values.
   */
  readonly parameterDefaults: Readonly<Record<string, unknown>>
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
  activeRouteParameterValues: Readonly<Record<string, unknown>>
}

const initialState: SimpluxRouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
}

const routerModule = createSimpluxModule('router', initialState)

const mutations = createMutations(routerModule, {
  addRoute: (
    { routes },
    name: SimpluxRouteName,
    configuration?: SimpluxRouteConfiguration<any>,
  ) => {
    routes.push({
      name,
      parameterDefaults: configuration?.parameterDefaults || {},
    })
  },

  activateRoute: (
    state,
    routeId: SimpluxRouteId,
    parameters: Readonly<Record<string, unknown>>,
  ) => {
    state.activeRouteId = routeId
    state.activeRouteParameterValues = parameters
  },
})

const selectors = createSelectors(routerModule, {
  state: (s) => s,

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

    return { ...route.parameterDefaults, ...activeRouteParameterValues }
  },
})

const effects = createEffects({
  registerRoute: (
    name: SimpluxRouteName,
    configuration?: SimpluxRouteConfiguration<any>,
  ): SimpluxRouteId => {
    const updatedState = mutations.addRoute(name, configuration)
    return updatedState.routes.length
  },

  navigateToRoute: (
    routeId: SimpluxRouteId,
    parameters: Readonly<Record<string, unknown>>,
  ) => {
    mutations.activateRoute(routeId, parameters)
  },
})

// tslint:disable-next-line:variable-name (internal export)
export const _module = {
  ...routerModule,
  ...mutations,
  ...selectors,
  ...effects,
}

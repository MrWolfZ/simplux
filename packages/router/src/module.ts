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
  readonly parameterDefaults: Record<string, unknown>

  /**
   * Whether the route is active.
   */
  isActive: boolean

  /**
   * The parameter values for the route. Will be `{}`
   * while the route is not active.
   */
  parameterValues: Record<string, unknown>
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
}

const initialState: SimpluxRouterState = {
  routes: [],
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
      isActive: false,
      parameterValues: {},
    })
  },

  activateRoute: (
    { routes },
    routeId: SimpluxRouteId,
    parameters: Record<string, unknown>,
  ) => {
    const idx = routeId - 1

    routes[idx].isActive = true
    routes[idx].parameterValues = parameters

    for (let i = 0; i < routes.length; i += 1) {
      if (i !== idx) {
        routes[i].isActive = false
        routes[i].parameterValues = {}
      }
    }
  },
})

const selectors = createSelectors(routerModule, {
  state: (s) => s,

  routeIsActive: ({ routes }, routeId: SimpluxRouteId) =>
    routes[routeId - 1]?.isActive ?? false,

  routeParameterValues: ({ routes }, routeId: SimpluxRouteId) => {
    const route = routes[routeId - 1]

    if (process.env.NODE_ENV !== 'production') {
      if (!route) {
        throw new Error(`route with ID ${routeId} does not exist`)
      }

      if (!route.isActive) {
        throw new Error(`route ${route.name} with ID ${routeId} is not active`)
      }
    }

    if (!route?.isActive) {
      return undefined
    }

    return { ...route.parameterDefaults, ...route.parameterValues }
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
    parameters: Record<string, unknown>,
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

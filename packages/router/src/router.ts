import type { Immutable, SimpluxSelector } from '@simplux/core'
import { SimpluxRouteName, SimpluxRouterState, _module } from './module.js'
import {
  SimpluxRoute,
  SimpluxRouteConfiguration,
  _createRoute,
} from './route.js'

/**
 * A router that allows navigating between different routes.
 *
 * @public
 */
export interface SimpluxRouter {
  /**
   * A selector to get the current router state.
   *
   * @returns the router state
   *
   * @public
   */
  readonly state: SimpluxSelector<
    SimpluxRouterState,
    [],
    Immutable<SimpluxRouterState>
  >

  /**
   * Add a new route to the router.
   *
   * @param name - the name of the route
   * @param routeConfiguration - configuration for the route
   *
   * @returns a route object for interacting with the route
   *
   * @public
   */
  readonly addRoute: <TParameters extends Record<string, unknown> = {}>(
    name: SimpluxRouteName,
    routeConfiguration?: SimpluxRouteConfiguration<TParameters>,
  ) => SimpluxRoute<TParameters>
}

/**
 * Create the simplux router (this creates a global singleton,
 * therefore calling this method multiple times is not recommended).
 *
 * @public
 */
export function createSimpluxRouter(): SimpluxRouter {
  return {
    state: _module.state,
    addRoute: _createRoute,
  }
}

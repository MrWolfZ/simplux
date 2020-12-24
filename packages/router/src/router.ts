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
  readonly addRoute: <TParameters extends Record<string, any> = {}>(
    name: SimpluxRouteName,
    routeConfiguration?: SimpluxRouteConfiguration<TParameters>,
  ) => SimpluxRoute<TParameters>
}

// tslint:disable-next-line:variable-name (internal export)
export const _router: SimpluxRouter = {
  state: _module.state,
  addRoute: _createRoute,
}

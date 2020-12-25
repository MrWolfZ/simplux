import type { Immutable, SimpluxEffect, SimpluxSelector } from '@simplux/core'
import {
  NavigationResult,
  SimpluxRouteId,
  SimpluxRouteName,
  SimpluxRouterState,
  _module,
  _NavigationParameters,
} from './module.js'
import {
  SimpluxRoute,
  SimpluxRouteConfiguration,
  _routeEffects,
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
   */
  readonly addRoute: SimpluxEffect<
    <TParameters extends _NavigationParameters = {}>(
      name: SimpluxRouteName,
      routeConfiguration?: SimpluxRouteConfiguration<TParameters>,
    ) => SimpluxRoute<TParameters>
  >

  /**
   * Navigate to a route with the given parameters.
   *
   * @param routeId - the ID of the route to navigate to
   * @param parameters - the parameters for the navigation
   *
   * @internal
   */
  readonly navigateToRouteById: SimpluxEffect<
    (
      routeId: SimpluxRouteId,
      parameters?: Readonly<_NavigationParameters>,
    ) => NavigationResult
  >
}

// tslint:disable-next-line:variable-name (internal export)
export const _router: SimpluxRouter = {
  state: _module.state,
  addRoute: _routeEffects.addRoute,
  navigateToRouteById: _module.navigateToRoute,
}

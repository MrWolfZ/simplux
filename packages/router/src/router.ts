import type { Immutable, SimpluxEffect, SimpluxSelector } from '@simplux/core'
import {
  NavigationParameters,
  NavigationResult,
  _module,
  _RouteId,
  _RouterState,
} from './module.js'
import {
  SimpluxRoute,
  SimpluxRouteConfiguration,
  _routeEffects,
} from './route.js'

/**
 * The selectors to check the router's state.
 *
 * @public
 */
export interface SimpluxRouterSelectors {
  /**
   * A selector to check if any route is active (useful to trigger
   * a default navigation).
   *
   * @returns `true` if any route is currently active, otherwise `false`
   */
  readonly anyRouteIsActive: SimpluxSelector<never, [], boolean>

  /**
   * A selector to check if a navigation is currently in progress.
   *
   * @returns `true` if a navigation is in progress, otherwise `false`
   */
  readonly navigationIsInProgress: SimpluxSelector<never, [], boolean>
}

/**
 * A router that allows navigating between different routes.
 *
 * @public
 */
export interface SimpluxRouter extends SimpluxRouterSelectors {
  /**
   * A selector to get the current router state.
   *
   * @returns the router state
   *
   * @internal
   */
  readonly state: SimpluxSelector<_RouterState, [], Immutable<_RouterState>>

  /**
   * Add a new route to the router.
   *
   * @param name - the name of the route
   * @param routeConfiguration - configuration for the route
   *
   * @returns a route object for interacting with the route
   */
  readonly addRoute: SimpluxEffect<
    <TParameters extends NavigationParameters = {}>(
      name: string,
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
      routeId: _RouteId,
      parameters?: Readonly<NavigationParameters>,
    ) => NavigationResult
  >
}

// tslint:disable-next-line:variable-name (internal export)
export const _router: SimpluxRouter = {
  state: _module.state,
  anyRouteIsActive: _module.anyRouteIsActive as any,
  navigationIsInProgress: _module.navigationIsInProgress as any,
  addRoute: _routeEffects.addRoute,
  navigateToRouteById: _module.navigateToRoute,
}

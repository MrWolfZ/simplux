import type { Immutable, SimpluxEffect, SimpluxSelector } from '@simplux/core'
import type { NavigationResult } from '@simplux/router'
import {
  SimpluxBrowserRouterState,
  _Href,
  _module,
  _NavigationParameters,
  _UrlTemplate,
} from './module.js'
import {
  SimpluxBrowserRoute,
  SimpluxBrowserRouteConfiguration,
  TemplateParameters,
  _routeEffects,
} from './route.js'

/**
 * Add a new route with the given template to the router.
 *
 * Parameter types are automatically parsed from the template.
 *
 * @param name - the name of the route
 * @param routeConfiguration - configuration for the route
 *
 * @returns a route object for interacting with the route
 *
 * @public
 */
export declare function _addRoute<TUrlTemplate extends _UrlTemplate>(
  urlTemplate: TUrlTemplate,
  routeConfiguration?: SimpluxBrowserRouteConfiguration,
): SimpluxBrowserRoute<
  {
    // this duplication is to get tooling to display the inferred parameter object
    // as a single object instead of an intersection of objects, e.g. show
    // { param1: string; param2?: string } instead of { param1: string } & { param2?: string }
    [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
  }
>

/**
 * Add a new route with the given template and parameter types
 * to the router.
 *
 * @param name - the name of the route
 * @param routeConfiguration - configuration for the route
 *
 * @returns a route object for interacting with the route
 *
 * @public
 */
export declare function _addRoute<
  TPathParameters extends _NavigationParameters<any> = {},
  TQueryParameters extends _NavigationParameters<any> = {}
>(
  urlTemplate: string,
  routeConfiguration?: SimpluxBrowserRouteConfiguration,
): SimpluxBrowserRoute<TPathParameters & TQueryParameters>

/**
 * A router that allows navigating between different routes by
 * using the browser URL.
 *
 * @public
 */
export interface SimpluxBrowserRouter {
  /**
   * A selector to get the current router state.
   *
   * @returns the router state
   */
  readonly state: SimpluxSelector<
    SimpluxBrowserRouterState,
    [],
    Immutable<SimpluxBrowserRouterState>
  >

  // no tsdoc since it inherits the docs of the declared
  // function above
  readonly addRoute: SimpluxEffect<typeof _addRoute>

  /**
   * Navigate to a URL. Does the same as if the URL was entered in the
   * browser address bar. The URL must be relative to your site root.
   *
   * @param url - URL to navigate to
   *
   * @returns the result of the navigation
   */
  navigateToUrl: SimpluxEffect<(url: _Href) => NavigationResult>

  /**
   * Connect the router to the browser location mechanism. The router will
   * start listening to location changes and will update the location on
   * route navigations.
   *
   * @param location - the location mechanism to use (e.g. `window.location`)
   *
   * @returns a function that can be called to deactivate the router
   */
  activate: SimpluxEffect<(location: Location) => () => void>
}

// tslint:disable-next-line:variable-name (internal export)
export const _router: SimpluxBrowserRouter = {
  state: _module.state,
  addRoute: _routeEffects.addRoute,
  navigateToUrl: _module.navigateToRouteByUrl,
  activate: undefined!,
}

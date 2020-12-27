import type { Immutable, SimpluxEffect, SimpluxSelector } from '@simplux/core'
import {
  getSimpluxRouter,
  NavigationResult,
  SimpluxRouterSelectors,
} from '@simplux/router'
import { _locationModule } from './location.js'
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

const simpluxRouter = getSimpluxRouter()

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
  routeConfiguration?: SimpluxBrowserRouteConfiguration<
    {
      // this duplication is to get tooling to display the inferred parameter object
      // as a single object instead of an intersection of objects, e.g. show
      // { param1: string; param2?: string } instead of { param1: string } & { param2?: string };
      // introducing another wrapper type (e.g. _Params) would also lead to _Params<'route'>
      // to be shown
      [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
    }
  >,
): SimpluxBrowserRoute<
  {
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
  routeConfiguration?: SimpluxBrowserRouteConfiguration<
    TPathParameters & TQueryParameters
  >,
): SimpluxBrowserRoute<TPathParameters & TQueryParameters>

/**
 * A router that allows navigating between different routes by
 * using the browser URL.
 *
 * @public
 */
export interface SimpluxBrowserRouter extends SimpluxRouterSelectors {
  /**
   * A selector to get the current router state.
   *
   * @returns the router state
   *
   * @internal
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
   * browser address bar. The URL is treated as relative to your site root,
   * i.e. the URL is always prefixed with `/` if it is not already.
   *
   * @param url - URL to navigate to
   *
   * @returns the result of the navigation
   */
  readonly navigateToUrl: SimpluxEffect<(url: _Href) => NavigationResult>

  /**
   * Connect the router to the browser window. The router will start
   * listening to location changes and will update the location on
   * route navigations.
   *
   * @param window - the window object
   *
   * @returns a function that can be called to deactivate the router
   */
  readonly activate: SimpluxEffect<(window: Window) => () => void>
}

// tslint:disable-next-line:variable-name (internal export)
export const _router: SimpluxBrowserRouter = {
  state: _module.state,
  anyRouteIsActive: simpluxRouter.anyRouteIsActive,
  navigationIsInProgress: simpluxRouter.navigationIsInProgress,
  addRoute: _routeEffects.addRoute,
  navigateToUrl: _module.navigateToRouteByUrl,
  activate: _locationModule.activate,
}

import type { Immutable, SimpluxEffect, SimpluxSelector } from '@simplux/core'
import {
  getSimpluxRouter,
  NavigationResult,
  SimpluxRouterSelectors,
} from '@simplux/router'
import { _locationModule } from './location.js'
import { _BrowserRouterState, _module } from './module.js'
import {
  SimpluxBrowserRoute,
  SimpluxBrowserRouteConfiguration,
  TemplateParameters,
  _routeEffects,
} from './route.js'

const simpluxRouter = getSimpluxRouter()

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
    _BrowserRouterState,
    [],
    Immutable<_BrowserRouterState>
  >

  /**
   * A selector to get the URL of the current navigation (if a navigation
   * is currently ongoing). Useful for remembering the URL when redirecting
   * to a different route inside `onNavigateTo`.
   *
   * @returns the URL of the current navigation if a navigation is currently
   * ongoing, otherwise `undefined`
   */
  readonly currentNavigationUrl: SimpluxSelector<never, [], string | undefined>

  /**
   * Add a new route with the given template to the router.
   *
   * Parameter types are automatically parsed from the template.
   *
   * @param template - the template of the route
   * @param routeConfiguration - configuration for the route
   *
   * @returns a route object for interacting with the route
   */
  readonly addRoute: SimpluxEffect<
    <
      TUrlTemplate extends string,
      TConfiguration extends SimpluxBrowserRouteConfiguration<
        {
          [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
        }
      >
    >(
      template: TUrlTemplate,
      routeConfiguration?: TConfiguration,
    ) => SimpluxBrowserRoute<
      {
        // this duplication is to get tooling to display the inferred parameter object
        // as a single object instead of an intersection of objects, e.g. show
        // { param1: string; param2?: string } instead of { param1: string } & { param2?: string };
        // introducing another wrapper type (e.g. _Params) would also lead to _Params<'route'>
        // to be shown
        [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
      },
      TConfiguration
    >
  >

  /**
   * Navigate to a URL. Does the same as if the URL was entered in the
   * browser address bar. The URL is treated as relative to your site root,
   * i.e. the URL is always prefixed with `/` if it is not already.
   *
   * @param url - URL to navigate to
   *
   * @returns the result of the navigation
   */
  readonly navigateToUrl: SimpluxEffect<(url: string) => NavigationResult>

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
  currentNavigationUrl: _module.currentNavigationUrl as any,
  addRoute: _routeEffects.addRoute as any,
  navigateToUrl: _module.navigateToRouteByUrl,
  activate: _locationModule.activate,
}

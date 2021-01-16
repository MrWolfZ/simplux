import { SimpluxBrowserRouter, _router } from './src/router.js'

// re-export everything from the router package to prevent users from having to
// import from multiple packages
export {
  NAVIGATION_CANCELLED,
  NAVIGATION_FINISHED,
  SIMPLUX_ROUTE,
} from '@simplux/router'
export type {
  NavigateToFn,
  NavigationParameters,
  NavigationResult,
  OnNavigateTo,
  OnNavigateToExtras,
  RequiredPropertyNames,
  SimpluxRoute,
  SimpluxRouteConfiguration,
  SimpluxRouterSelectors,
} from '@simplux/router'
export type { _Url } from './src/location.js'
export type { _BrowserRouterState } from './src/module.js'
export type {
  _ParameterName,
  _ParameterType,
  _ParameterValueType,
  _ParseParameter,
  _ParseParameterType,
} from './src/parameter.js'
export type { _ParsePathParameters } from './src/path.js'
export type { _ParseQueryParameters } from './src/query.js'
export type {
  _BrowserRouteTemplate,
  _BrowserRouteTreeNode,
  _QueryParameterValues,
  _RoutePathTemplateConstantSegment,
  _RoutePathTemplateParameterSegment,
  _RoutePathTemplateSegment,
  _RouteQueryTemplateParameter,
  _UrlTemplate,
} from './src/route-tree.js'
export type {
  HrefSelectorParameters,
  SimpluxBrowserRoute,
  SimpluxBrowserRouteConfiguration,
  TemplateParameters,
} from './src/route.js'
export type { SimpluxBrowserRouter } from './src/router.js'

/**
 * Get the simplux browser router.
 *
 * @public
 */
export function getSimpluxBrowserRouter(): SimpluxBrowserRouter {
  return _router
}

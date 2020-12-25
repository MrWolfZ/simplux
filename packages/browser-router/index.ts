import { SimpluxBrowserRouter, _router } from './src/router.js'

export type {
  SimpluxBrowserRouterState,
  SimpluxBrowserRouteState,
  _Href,
  _NavigationParameters,
  _QueryParameterValues,
  _RouteQueryParameterState,
  _UrlTemplate,
} from './src/module.js'
export type {
  _ParameterName,
  _ParameterType,
  _ParameterValueType,
  _ParseParameter,
  _ParseParameterType,
} from './src/parameter.js'
export type {
  _ParsePathParameters,
  _RoutePathTemplateConstantSegment,
  _RoutePathTemplateParameterSegment,
  _RoutePathTemplateSegment,
} from './src/path.js'
export type { _ParseQueryParameters } from './src/query.js'
export type {
  SimpluxBrowserRoute,
  SimpluxBrowserRouteConfiguration,
  TemplateParameters,
  _HrefFunction,
  _HrefParameters,
  _RequiredPropertyNames,
} from './src/route.js'
export type { SimpluxBrowserRouter, _addRoute } from './src/router.js'

/**
 * Get the simplux browser router.
 *
 * @public
 */
export function getSimpluxBrowserRouter(): SimpluxBrowserRouter {
  return _router
}

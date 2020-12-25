import { SimpluxBrowserRouter, _router } from './src/router.js'

export type {
  SimpluxBrowserRouterState,
  SimpluxBrowserRouteState,
  _UrlTemplate,
} from './src/module.js'
export type {
  _ParameterName,
  _ParameterType,
  _ParseParameter,
  _ParseParameterType,
} from './src/parameter.js'
export type {
  _ParsePathParameters,
  _RoutePathTemplateConstantSegment,
  _RoutePathTemplateParameterSegment,
  _RoutePathTemplateSegment,
} from './src/path.js'
export type {
  _ParseQueryParameters,
  _RouteQueryParameter,
} from './src/query.js'
export type {
  HrefFunction,
  SimpluxBrowserRoute,
  SimpluxBrowserRouteConfiguration,
  TemplateParameters,
  _Href,
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

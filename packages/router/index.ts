import { SimpluxRouter, _router } from './src/router.js'

export { NAVIGATION_CANCELLED, NAVIGATION_FINISHED } from './src/module.js'
export type {
  NavigationParameters,
  NavigationResult,
  OnNavigateTo,
  OnNavigateToExtras,
  _ParameterName,
  _RouteId,
  _RouteName,
  _RouterState,
  _RouteState,
} from './src/module.js'
export { SIMPLUX_ROUTE, _isSimpluxRoute } from './src/route.js'
export type {
  NavigateToFn,
  RequiredPropertyNames,
  SimpluxRoute,
  SimpluxRouteConfiguration,
  SimpluxRouteMarker,
} from './src/route.js'
export type { SimpluxRouter, SimpluxRouterSelectors } from './src/router.js'

/**
 * Get the simplux router.
 *
 * @public
 */
export function getSimpluxRouter(): SimpluxRouter {
  return _router
}

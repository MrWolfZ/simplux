import { SimpluxRouter, _router } from './src/router.js'

export { NAVIGATION_CANCELLED } from './src/module.js'
export type {
  NavigationParameters,
  NavigationResult,
  OnNavigateTo,
  OnNavigateToArgs,
  _RouteId,
  _RouteName,
  _RouterState,
  _RouteState,
} from './src/module.js'
export type {
  NavigateToFn,
  RequiredPropertyNames,
  SimpluxRoute,
  SimpluxRouteConfiguration,
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

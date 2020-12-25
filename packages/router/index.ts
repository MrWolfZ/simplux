import { SimpluxRouter, _router } from './src/router.js'

export type {
  NavigationResult,
  SimpluxRouteId,
  SimpluxRouteName,
  SimpluxRouterState,
  SimpluxRouteState,
  _NavigationParameters,
} from './src/module.js'
export type {
  NavigateToFn,
  SimpluxRoute,
  SimpluxRouteConfiguration,
  _RequiredPropertyNames,
} from './src/route.js'
export type { SimpluxRouter } from './src/router.js'

/**
 * Get the simplux router.
 *
 * @public
 */
export function getSimpluxRouter(): SimpluxRouter {
  return _router
}

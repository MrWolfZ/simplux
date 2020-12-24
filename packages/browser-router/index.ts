import { SimpluxBrowserRouter, _router } from './src/router.js'

export type { SimpluxBrowserRouter } from './src/router.js'

/**
 * Get the simplux browser router.
 *
 * @public
 */
export function getSimpluxBrowserRouter(): SimpluxBrowserRouter {
  return _router
}

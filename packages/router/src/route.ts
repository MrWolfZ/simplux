import {
  createEffects,
  createSelectors,
  SimpluxEffect,
  SimpluxSelector,
} from '@simplux/core'
import {
  NavigationResult,
  SimpluxRouteId,
  SimpluxRouteName,
  SimpluxRouterState,
  _module,
  _NavigationParameters,
} from './module.js'

/**
 * The configuration for a route.
 *
 * @public
 */
export interface SimpluxRouteConfiguration<TParameters> {
  /**
   * @internal
   */
  readonly never?: TParameters
}

/**
 * Helper type to extract the required property names from an object
 *
 * @public
 */
export type _RequiredPropertyNames<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

/**
 * Navigate to the route.
 *
 * @public
 */
export type NavigateToFn<TParameters> = keyof TParameters extends never
  ? () => NavigationResult
  : _RequiredPropertyNames<TParameters> extends never
  ? (parameters?: TParameters) => NavigationResult
  : (parameters: TParameters) => NavigationResult

/**
 * A simplux route.
 *
 * @public
 */
export interface SimpluxRoute<TParameters = {}> {
  /**
   * The id of the route.
   *
   * @internal
   */
  readonly id: SimpluxRouteId

  /**
   * The name of the route.
   */
  readonly name: SimpluxRouteName

  /**
   * A selector for checking if the route is active.
   *
   * @returns `true` if the route is active, otherwise `false`
   */
  readonly isActive: SimpluxSelector<SimpluxRouterState, [], boolean>

  /**
   * A selector for getting the parameter values for this route.
   * Throws an error if the route is not active.
   *
   * @returns the current parameters for the route (if it is active)
   */
  readonly parameterValues: SimpluxSelector<SimpluxRouterState, [], TParameters>

  /**
   * Navigate to this route with the given parameters.
   *
   * @param parameters - the parameters for the navigation
   */
  readonly navigateTo: SimpluxEffect<NavigateToFn<TParameters>>
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeEffects = createEffects({
  addRoute: <TParameters extends _NavigationParameters = {}>(
    name: SimpluxRouteName,
    configuration?: SimpluxRouteConfiguration<TParameters>,
  ): SimpluxRoute<TParameters> => {
    const routeId = _module.registerRoute(name, configuration)

    const selectors = createSelectors(_module, {
      isActive: (state) => _module.routeIsActive.withState(state, routeId),

      parameterValues: (state) => {
        const values = _module.routeParameterValues.withState(state, routeId)
        return values as TParameters
      },
    })

    const { navigateTo } = createEffects({
      navigateTo: (parameters?: TParameters): NavigationResult =>
        _module.navigateToRoute(routeId, parameters || {}),
    })

    return {
      id: routeId,
      name,
      ...selectors,
      navigateTo: navigateTo as SimpluxEffect<NavigateToFn<TParameters>>,
    }
  },
})

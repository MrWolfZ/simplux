import {
  createEffects,
  createSelectors,
  SimpluxEffect,
  SimpluxSelector,
} from '@simplux/core'
import { SimpluxRouteName, SimpluxRouterState, _module } from './module.js'

/**
 * The configuration for a route.
 *
 * @public
 */
export interface SimpluxRouteConfiguration<TParameters> {
  readonly parameterDefaults?: Partial<TParameters> // TODO: infer optional parameters
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
  ? () => void
  : _RequiredPropertyNames<TParameters> extends never
  ? (parameters?: TParameters) => void
  : (parameters: TParameters) => void

/**
 * A simplux route.
 *
 * @public
 */
export interface SimpluxRoute<TParameters = {}> {
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
  addRoute: <TParameters extends Record<string, any> = {}>(
    name: SimpluxRouteName,
    configuration: SimpluxRouteConfiguration<TParameters> | undefined,
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
      navigateTo: (parameters?: TParameters) =>
        _module.navigateToRoute(routeId, parameters || {}),
    })

    return {
      name,
      ...selectors,
      navigateTo: navigateTo as SimpluxEffect<NavigateToFn<TParameters>>,
    }
  },
})

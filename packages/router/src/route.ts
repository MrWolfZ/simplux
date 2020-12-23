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
  readonly parameterDefaults?: TParameters // TODO: infer optional parameters
}

/**
 * A simplux route.
 *
 * @public
 */
export interface SimpluxRoute<TName extends SimpluxRouteName, TParameters> {
  /**
   * The name of the route.
   */
  readonly name: TName

  /**
   * A selector for checking if the route is active.
   */
  readonly isActive: SimpluxSelector<SimpluxRouterState, [], boolean>

  /**
   * A selector for getting the parameter values for this route. Will throw
   * when called while the route is not active.
   */
  readonly parameterValues: SimpluxSelector<SimpluxRouterState, [], TParameters>

  /**
   * Navigate to this route with the given parameters.
   */
  readonly navigateTo: SimpluxEffect<(parameters: TParameters) => void>
}

/**
 * @internal
 */
export function _createRoute<
  TName extends SimpluxRouteName,
  TParameters extends Record<string, unknown> = {}
>(
  name: TName,
  configuration: SimpluxRouteConfiguration<TParameters> | undefined,
): SimpluxRoute<TName, TParameters> {
  const routeId = _module.registerRoute(name, configuration)

  const selectors = createSelectors(_module, {
    isActive: (state) => _module.routeIsActive.withState(state, routeId),

    parameterValues: (state) =>
      (_module.routeParameterValues.withState(
        state,
        routeId,
      ) as unknown) as TParameters,
  })

  const effects = createEffects({
    navigateTo: (parameters: TParameters) =>
      _module.navigateToRoute(routeId, parameters),
  })

  return {
    name,
    ...selectors,
    ...effects,
  }
}

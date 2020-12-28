import {
  createEffects,
  createSelectors,
  SimpluxEffect,
  SimpluxSelector,
} from '@simplux/core'
import {
  NavigationResult,
  OnNavigateTo,
  _module,
  _RouteId,
  _RouteName,
} from './module.js'

/**
 * Helper symbol used for identifying simplux route objects.
 *
 * @public
 */
// should really be a symbol, but as of TypeScript 4.1 there is a bug
// that causes the symbol to not be properly re-exported in type
// definitions when spreading a select object onto an export, which can
// cause issues with composite builds
export const SIMPLUX_ROUTE = '[SIMPLUX_ROUTE]'

/**
 * The configuration for a route.
 *
 * @public
 */
export interface SimpluxRouteConfiguration<TParameters> {
  /**
   * A function to be called when navigation to the route starts.
   */
  readonly onNavigateTo?: OnNavigateTo<TParameters>
}

/**
 * Helper type to extract the required property names from an object
 *
 * @public
 */
export type RequiredPropertyNames<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

/**
 * Navigate to the route.
 *
 * @public
 */
export type NavigateToFn<TParameters> = keyof TParameters extends never
  ? () => NavigationResult
  : RequiredPropertyNames<TParameters> extends never
  ? (parameters?: TParameters) => NavigationResult
  : (parameters: TParameters) => NavigationResult

/**
 * Interface for efficiently identifying simplux route objects at compile time.
 *
 * @public
 */
export interface SimpluxRouteMarker<
  TParameters,
  TConfiguration extends SimpluxRouteConfiguration<TParameters>
> {
  /**
   * A symbol that allows efficient compile-time and run-time identification
   * of simplux route objects.
   *
   * This property will have an `undefined` value at runtime.
   *
   * @public
   */
  readonly [SIMPLUX_ROUTE]: [TParameters, TConfiguration]
}

/**
 * A simplux route.
 *
 * @public
 */
export interface SimpluxRoute<
  TParameters,
  TConfiguration extends SimpluxRouteConfiguration<TParameters> = {}
> extends SimpluxRouteMarker<TParameters, TConfiguration> {
  /**
   * The id of the route.
   *
   * @internal
   */
  readonly id: _RouteId

  /**
   * The unique name of the route.
   */
  readonly name: string

  /**
   * A selector for checking if the route is active.
   *
   * @returns `true` if the route is active, otherwise `false`
   */
  readonly isActive: SimpluxSelector<never, [], boolean>

  /**
   * A selector for getting the parameter values for this route.
   * Throws an error if the route is not active.
   *
   * @returns the current parameters for the route (if it is active)
   */
  readonly parameterValues: SimpluxSelector<never, [], TParameters>

  /**
   * Navigate to this route with the given parameters.
   *
   * @param parameters - the parameters for the navigation
   */
  readonly navigateTo: SimpluxEffect<NavigateToFn<TParameters>>

  /**
   * The `onNavigateTo` function (if any) from the route configuration.
   */
  readonly onNavigateTo: TConfiguration['onNavigateTo']
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeEffects = createEffects({
  addRoute: <
    TParameters,
    // tslint:disable-next-line: max-line-length
    TConfiguration extends SimpluxRouteConfiguration<TParameters> = SimpluxRouteConfiguration<TParameters>
  >(
    name: _RouteName,
    configuration?: TConfiguration,
  ): SimpluxRoute<TParameters, TConfiguration> => {
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
      isActive: selectors.isActive as any,
      parameterValues: selectors.parameterValues as any,
      navigateTo: navigateTo as SimpluxEffect<NavigateToFn<TParameters>>,
      onNavigateTo: configuration?.onNavigateTo,
      [SIMPLUX_ROUTE]: undefined!,
    }
  },
})

/**
 * Checks if an object is a simplux route.
 *
 * @param object - the object to check
 *
 * @returns true if the object is a simplux route
 *
 * @internal
 */
export function _isSimpluxRoute<
  TParameters,
  TConfiguration extends SimpluxRouteConfiguration<TParameters>,
  TOther
>(
  object: SimpluxRouteMarker<TParameters, TConfiguration> | TOther,
): object is SimpluxRoute<TParameters, TConfiguration> {
  return object && Object.prototype.hasOwnProperty.call(object, SIMPLUX_ROUTE)
}

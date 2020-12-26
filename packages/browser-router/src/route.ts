import { createEffects, createSelectors, SimpluxSelector } from '@simplux/core'
import {
  getSimpluxRouter,
  NavigateToFn,
  NavigationResult,
  SimpluxRoute,
  SimpluxRouteConfiguration,
  SimpluxRouteName,
} from '@simplux/router'
import {
  SimpluxBrowserRouterState,
  _Href,
  _module,
  _NavigationParameters,
  _UrlTemplate,
} from './module.js'
import type { _ParsePathParameters } from './path.js'
import type { _ParseQueryParameters } from './query.js'

/**
 * Helper type to parse parameters from a URL template.
 *
 * @public
 */
export type TemplateParameters<
  TUrlTemplate extends _UrlTemplate
> = TUrlTemplate extends `${infer TPathTemplate}[?${infer TQueryTemplate}]`
  ? _ParsePathParameters<TPathTemplate> &
      Partial<_ParseQueryParameters<TQueryTemplate>>
  : TUrlTemplate extends `${infer TPathTemplate}?${infer TQueryTemplate}`
  ? _ParsePathParameters<TPathTemplate> & _ParseQueryParameters<TQueryTemplate>
  : _ParsePathParameters<TUrlTemplate>

/**
 * The configuration for a browser route.
 *
 * @public
 */
export interface SimpluxBrowserRouteConfiguration
  extends SimpluxRouteConfiguration<never> {
  /**
   * An optional name for the route. If not provided the template will be
   * used as the name.
   */
  readonly name?: SimpluxRouteName
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
 * Helper type to specify the parameters for an href selector
 *
 * @public
 */
export type _HrefParameters<TParameters> = keyof TParameters extends never
  ? []
  : _RequiredPropertyNames<TParameters> extends never
  ? [parameters: TParameters] | []
  : [parameters: TParameters]

export type _HrefFunction<TParameters> = NavigateToFn<TParameters>

/**
 * A simplux browser route.
 *
 * @public
 */
export interface SimpluxBrowserRoute<TParameters = {}>
  extends SimpluxRoute<TParameters> {
  /**
   * Helper property to get the parameter type of this route via
   * `typeof route.$parameterTypes`. Will be `undefined` at runtime.
   */
  readonly $parameterTypes: TParameters

  /**
   * A selector for generating an href value for the route with the given
   * parameters.
   *
   * @param parameters - the parameters for the navigation (if the route has any)
   *
   * @returns an href string that can be used to link to this route (e.g.
   * in HTML anchors)
   */
  readonly href: SimpluxSelector<
    SimpluxBrowserRouterState,
    _HrefParameters<TParameters>,
    _Href
  >
}

function addRoute<TUrlTemplate extends _UrlTemplate>(
  urlTemplate: TUrlTemplate,
  routeConfiguration?: SimpluxBrowserRouteConfiguration,
): SimpluxBrowserRoute<
  {
    // this duplication is to get tooling to display the inferred parameter object
    // as a single object instead of an intersection of objects, e.g. show
    // { param1: string; param2?: string } instead of { param1: string } & { param2?: string }
    [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
  }
>

function addRoute<
  TPathParameters extends _NavigationParameters<any> = {},
  TQueryParameters extends _NavigationParameters<any> = {}
>(
  urlTemplate: string,
  routeConfiguration?: SimpluxBrowserRouteConfiguration,
): SimpluxBrowserRoute<TPathParameters & TQueryParameters>

function addRoute(
  urlTemplate: _UrlTemplate,
  routeConfiguration?: SimpluxBrowserRouteConfiguration,
): SimpluxBrowserRoute<unknown> {
  const name = routeConfiguration?.name || urlTemplate

  const route = getSimpluxRouter().addRoute(name, routeConfiguration)

  _module.addRoute(route.id, urlTemplate)

  const selectors = createSelectors(_module, {
    href: (state, parameterValues?: _NavigationParameters) =>
      _module.href.withState(state, route.id, parameterValues),
  })

  const { navigateTo } = createEffects({
    navigateTo: (parameters?: _NavigationParameters): NavigationResult =>
      _module.navigateToRouteById(route.id, parameters || {}),
  })

  return {
    ...route,
    ...selectors,
    navigateTo,
    $parameterTypes: undefined!,
  }
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeEffects = createEffects({
  addRoute,
})

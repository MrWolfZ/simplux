import { createEffects, createSelectors, SimpluxSelector } from '@simplux/core'
import {
  getSimpluxRouter,
  NavigateToFn,
  NavigationParameters,
  NavigationResult,
  RequiredPropertyNames,
  SimpluxRoute,
  SimpluxRouteConfiguration,
} from '@simplux/router'
import { _module, _UrlTemplate } from './module.js'
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
export interface SimpluxBrowserRouteConfiguration<TParameters>
  extends SimpluxRouteConfiguration<TParameters> {
  /**
   * An optional name for the route. If not provided the template will be
   * used as the name.
   */
  readonly name?: string
}

/**
 * Helper type to specify the parameters for an href selector
 *
 * @public
 */
export type HrefSelectorParameters<
  TParameters
> = keyof TParameters extends never
  ? []
  : RequiredPropertyNames<TParameters> extends never
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
    never,
    HrefSelectorParameters<TParameters>,
    string
  >
}

function addRoute<TUrlTemplate extends _UrlTemplate>(
  urlTemplate: TUrlTemplate,
  routeConfiguration?: SimpluxBrowserRouteConfiguration<
    {
      // this duplication is to get tooling to display the inferred parameter object
      // as a single object instead of an intersection of objects, e.g. show
      // { param1: string; param2?: string } instead of { param1: string } & { param2?: string };
      // introducing another wrapper type (e.g. _Params) would also lead to _Params<'route'>
      // to be shown
      [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
    }
  >,
): SimpluxBrowserRoute<
  {
    [p in keyof TemplateParameters<TUrlTemplate>]: TemplateParameters<TUrlTemplate>[p]
  }
>

function addRoute<
  TPathParameters extends NavigationParameters = {},
  TQueryParameters extends NavigationParameters = {}
>(
  urlTemplate: string,
  routeConfiguration?: SimpluxBrowserRouteConfiguration<
    TPathParameters & TQueryParameters
  >,
): SimpluxBrowserRoute<TPathParameters & TQueryParameters>

function addRoute(
  urlTemplate: _UrlTemplate,
  routeConfiguration?: SimpluxBrowserRouteConfiguration<any>,
): SimpluxBrowserRoute<unknown> {
  const name = routeConfiguration?.name || urlTemplate

  const route = getSimpluxRouter().addRoute(name, routeConfiguration)

  _module.addRoute(route.id, urlTemplate)

  const selectors = createSelectors(_module, {
    href: (state, parameterValues?: NavigationParameters) =>
      _module.href.withState(state, route.id, parameterValues),
  })

  const { navigateTo } = createEffects({
    navigateTo: (parameters?: NavigationParameters): NavigationResult =>
      _module.navigateToRouteById(route.id, parameters || {}),
  })

  return {
    ...route,
    href: selectors.href as any,
    navigateTo,
    $parameterTypes: undefined!,
  }
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeEffects = createEffects({
  addRoute,
})

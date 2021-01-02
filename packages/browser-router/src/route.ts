import {
  createEffects,
  createSelectors,
  Immutable,
  SimpluxEffect,
  SimpluxSelector,
} from '@simplux/core'
import {
  getSimpluxRouter,
  NavigateToFn,
  NavigationParameters,
  NavigationResult,
  RequiredPropertyNames,
  SimpluxRoute,
  SimpluxRouteConfiguration,
  _RouteId,
} from '@simplux/router'
import type { _Url } from './location.js'
import { _BrowserRouterState, _module } from './module.js'
import type { _ParsePathParameters } from './path.js'
import type { _ParseQueryParameters } from './query.js'
import type { _UrlTemplate } from './route-tree.js'

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
  extends SimpluxRouteConfiguration<TParameters> {}

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
export interface SimpluxBrowserRoute<
  TParameters,
  TConfiguration extends SimpluxRouteConfiguration<TParameters> = {}
> extends Omit<SimpluxRoute<TParameters, TConfiguration>, 'addChildRoute'> {
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

  /**
   * Add a child route with the given template to the route. The child
   * route's template will be the concatenation of this route's template
   * and the child's template.
   *
   * Parameter types are automatically parsed from the template.
   *
   * @param template - the template of the route
   * @param routeConfiguration - configuration for the route
   *
   * @returns a route object for interacting with the child route
   */
  readonly addChildRoute: SimpluxEffect<
    <
      TUrlTemplate extends string,
      TConfiguration extends SimpluxBrowserRouteConfiguration<
        {
          [p in keyof (TemplateParameters<TUrlTemplate> &
            TParameters)]: (TemplateParameters<TUrlTemplate> & TParameters)[p]
        }
      >
    >(
      template: TUrlTemplate,
      routeConfiguration?: TConfiguration,
    ) => SimpluxBrowserRoute<
      {
        // this duplication is to get tooling to display the inferred parameter object
        // as a single object instead of an intersection of objects, e.g. show
        // { param1: string; param2?: string } instead of { param1: string } & { param2?: string };
        // introducing another wrapper type (e.g. _Params) would also lead to _Params<'route'>
        // to be shown
        [p in keyof (TemplateParameters<TUrlTemplate> &
          TParameters)]: (TemplateParameters<TUrlTemplate> & TParameters)[p]
      },
      TConfiguration
    >
  >
}

function addRoute<
  TUrlTemplate extends _UrlTemplate,
  TConfiguration extends SimpluxBrowserRouteConfiguration<
    TemplateParameters<TUrlTemplate>
  >
>(
  urlTemplate: TUrlTemplate,
  routeConfiguration?: TConfiguration,
  parentRouteId?: _RouteId,
): SimpluxBrowserRoute<TemplateParameters<TUrlTemplate>, TConfiguration> {
  const route = getSimpluxRouter().addRouteInternal(
    urlTemplate,
    routeConfiguration as SimpluxRouteConfiguration<NavigationParameters>,
    parentRouteId,
    _module.parameterNamesForTemplate(parentRouteId, urlTemplate),
  )

  if (!parentRouteId) {
    _module.addRoute(route.id, urlTemplate)
  } else {
    _module.addChildRoute(parentRouteId, route.id, urlTemplate)
  }

  const selectors = createSelectors(_module, {
    href: createMemoizedHrefFn(route.id),
  })

  const { addChildRoute, navigateTo } = createEffects({
    addChildRoute: (
      childTemplate: _UrlTemplate,
      childConfiguration: SimpluxBrowserRouteConfiguration<any>,
    ) => addRoute(childTemplate, childConfiguration, route.id),

    navigateTo: (parameters?: NavigationParameters): NavigationResult =>
      _module.navigateToRouteById(route.id, parameters || {}),
  })

  return {
    ...(route as SimpluxRoute<any, TConfiguration>),
    href: selectors.href as any,
    addChildRoute: addChildRoute as any,
    navigateTo: navigateTo as any,
    $parameterTypes: undefined!,
  }
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeEffects = createEffects({
  addRoute,
})

type HrefSelectorFn = (
  state: Immutable<_BrowserRouterState>,
  parameterValues: NavigationParameters | undefined,
) => _Url

function createMemoizedHrefFn(routeId: _RouteId): HrefSelectorFn {
  let memParams: NavigationParameters | undefined
  let memHref: _Url

  const memoizedFunction: HrefSelectorFn = (state, newParams) => {
    const needToRefresh = !memHref || !shallowEquals(memParams, newParams)

    if (needToRefresh) {
      memParams = newParams
      memHref = _module.href.withState(state, routeId, newParams)
    }

    return memHref
  }

  return memoizedFunction
}

function shallowEquals(
  left: NavigationParameters | undefined,
  right: NavigationParameters | undefined,
) {
  if (left === right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  const allKeys = Object.keys({ ...left, ...right })
  return allKeys.every((key) => left[key] === right[key])
}

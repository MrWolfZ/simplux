import {
  createEffects,
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'
import {
  getSimpluxRouter,
  NavigationResult,
  SimpluxRouteId,
} from '@simplux/router'
import { _locationModule, _Url } from './location.js'
import type {
  _ParameterName,
  _ParameterType,
  _ParameterValueType,
} from './parameter.js'
import type { _RoutePathTemplateSegment } from './path.js'

const simpluxRouter = getSimpluxRouter()

/**
 * Helper type to distinguish url template values.
 *
 * @public
 */
export type _UrlTemplate = string

/**
 * Helper type to distinguish href values.
 *
 * @public
 */
export type _Href = string

/**
 * @internal
 */
export type _QueryParameterValues = Readonly<
  Record<_ParameterName, string | undefined>
>

/**
 * Helper type to distinguish navigation parameter values.
 *
 * @public
 */
export type _NavigationParameters<
  TParameterValueType = _ParameterValueType
> = Readonly<Record<string, TParameterValueType>>

/**
 * A query parameter for a route.
 *
 * @public
 */
export interface _RouteQueryParameterState {
  readonly parameterName: _ParameterName
  readonly parameterType: _ParameterType
  readonly isOptional: boolean
}

/**
 * The state of a simplux browser route.
 *
 * @public
 */
export interface SimpluxBrowserRouteState {
  /**
   * The path segments of the route.
   */
  readonly pathTemplateSegments: readonly _RoutePathTemplateSegment[]

  /**
   * The query parameters of the route.
   */
  readonly queryParameters: readonly _RouteQueryParameterState[]
}

/**
 * The state of the simplux browser router.
 *
 * @public
 */
export interface SimpluxBrowserRouterState {
  /**
   * All registered routes.
   */
  readonly routes: SimpluxBrowserRouteState[]

  /**
   * The URL of the current navigation.
   */
  currentNavigationUrl: _Url | undefined
}

const initialState: SimpluxBrowserRouterState = {
  routes: [],
  currentNavigationUrl: undefined,
}

const browserRouterModule = createSimpluxModule('browserRouter', initialState)

const mutations = createMutations(browserRouterModule, {
  addRoute: (
    { routes },
    routeId: SimpluxRouteId,
    urlTemplate: _UrlTemplate,
  ) => {
    urlTemplate = urlTemplate.replace(/^\//, '').replace(/\/$/, '')
    const [path, query] = urlTemplate.replace('[?', '?[').split('?')
    const pathTemplateSegments = !path ? [] : parsePathTemplate(path!)
    const queryParameters = parseQueryTemplate(query)

    routes[routeId - 1] = {
      pathTemplateSegments,
      queryParameters,
    }
  },

  setCurrentNavigationUrl: (state, url: _Url | undefined) => {
    state.currentNavigationUrl = url
  },
})

const selectors = createSelectors(browserRouterModule, {
  state: (s) => s,

  href: (
    { routes },
    routeId: SimpluxRouteId,
    parameterValues?: _NavigationParameters,
  ) => {
    const { pathTemplateSegments, queryParameters } = routes[routeId - 1]!

    const path = createPathForHref(pathTemplateSegments, parameterValues)
    const query = createQueryForHref(queryParameters, parameterValues)

    return `${!path ? '' : '/'}${path}${query}`
  },

  routeIdAndParametersByUrl: (
    { routes },
    url: _Href,
  ): [SimpluxRouteId, _NavigationParameters] | undefined => {
    const [path, query] = url.split('?')

    const trimmedPath = path!.replace(/^\//, '').replace(/\/$/, '')

    const pathSegments =
      trimmedPath === '' ? [] : trimmedPath.split('/').map(decodeURIComponent)

    const queryParameters = query
      ?.split('&')
      .map((p) => p.split('='))
      .reduce(
        (v, [name, value]) => ({ ...v, [decodeURIComponent(name!)]: value }),
        {} as _QueryParameterValues,
      )

    return findRouteForPathSegmentsAndQuery(
      routes,
      pathSegments,
      queryParameters || {},
    )
  },
})

const effects = createEffects({
  navigateToRouteByUrl: async (url: _Href): NavigationResult => {
    url = !url ? '' : url.startsWith('/') ? url : `/${url}`

    if (url === selectors.state().currentNavigationUrl) {
      return
    }

    const result = selectors.routeIdAndParametersByUrl(url)

    if (result) {
      const [routeId, parameters] = result
      mutations.setCurrentNavigationUrl(url)
      await simpluxRouter.navigateToRouteById(routeId, parameters)
      _locationModule.pushNewUrl(url)
      mutations.setCurrentNavigationUrl(undefined)
    } else {
      // should this throw?
    }
  },

  navigateToRouteById: async (
    routeId: SimpluxRouteId,
    parameterValues?: _NavigationParameters,
  ): NavigationResult => {
    const url = selectors.href(routeId, parameterValues)
    mutations.setCurrentNavigationUrl(url)
    await simpluxRouter.navigateToRouteById(routeId, parameterValues)
    _locationModule.pushNewUrl(url)
    mutations.setCurrentNavigationUrl(undefined)
  },
})

const sub = _locationModule.subscribeToStateChanges(
  ({ isActive, url }, { url: prevUrl }) => {
    if (isActive && url !== prevUrl) {
      effects.navigateToRouteByUrl(url).catch((err) => console.error(err))
    }
  },
)

// tslint:disable-next-line:variable-name (internal export)
export const _onLocationStateChange = sub.handler

// tslint:disable-next-line:variable-name (internal export)
export const _module = {
  ...browserRouterModule,
  ...mutations,
  ...selectors,
  ...effects,
}

function parsePathTemplate(
  template: string,
): readonly _RoutePathTemplateSegment[] {
  return template.split('/').map(parseSegment)

  function parseSegment(segment: string): _RoutePathTemplateSegment {
    if (segment.startsWith(':')) {
      const [, name, type] = segment.split(':')

      return {
        parameterName: name!,
        parameterType: (type || 'string') as _ParameterType,
      }
    }

    return segment
  }
}

function parseQueryTemplate(
  template: string | undefined,
): readonly _RouteQueryParameterState[] {
  if (!template) {
    return []
  }

  const [requiredPart, optionalPart] = template.replace('[&', '[').split('[')

  const required = !requiredPart
    ? []
    : requiredPart.split('&').map((p) => parseParameter(p, false))

  const optional = optionalPart
    ?.substr(0, optionalPart.length - 1)
    .split('&')
    .map((p) => parseParameter(p, true))

  return [...required, ...(optional || [])]

  function parseParameter(
    parameter: string,
    isOptional: boolean,
  ): _RouteQueryParameterState {
    const [name, type] = parameter.split(':')

    return {
      parameterName: name!,
      parameterType: (type || 'string') as _ParameterType,
      isOptional,
    }
  }
}

function createPathForHref(
  segments: readonly _RoutePathTemplateSegment[],
  parameterValues?: _NavigationParameters,
) {
  return segments.map(renderSegment).join('/')

  function renderSegment(segment: _RoutePathTemplateSegment) {
    return typeof segment === 'string'
      ? encodeURIComponent(segment)
      : encodeURIComponent(parameterValues?.[segment.parameterName]!)
  }
}

function createQueryForHref(
  parameters: readonly _RouteQueryParameterState[],
  parameterValues?: _NavigationParameters,
) {
  const formattedValues = parameters.map(renderParameter).filter((p) => !!p)

  if (formattedValues.length === 0) {
    return ``
  }

  return `?${formattedValues.join('&')}`

  function renderParameter({ parameterName }: _RouteQueryParameterState) {
    const value = parameterValues?.[parameterName]

    if (!value) {
      return ''
    }

    const encodedName = encodeURIComponent(parameterName)
    const encodedValue = encodeURIComponent(value)
    return `${encodedName}=${encodedValue}`
  }
}

function findRouteForPathSegmentsAndQuery(
  routes: readonly SimpluxBrowserRouteState[],
  pathSegments: _Href[],
  queryParameterValues: _QueryParameterValues,
): [SimpluxRouteId, _NavigationParameters] | undefined {
  for (let i = 0; i < routes.length; i += 1) {
    const result = tryMatchRoute(routes[i]!)

    if (result) {
      return [i + 1, result]
    }
  }

  return undefined

  function tryMatchRoute({
    pathTemplateSegments,
    queryParameters,
  }: SimpluxBrowserRouteState): _NavigationParameters | undefined {
    if (pathTemplateSegments.length !== pathSegments.length) {
      return undefined
    }

    for (let i = 0; i < pathTemplateSegments.length; i += 1) {
      if (!pathSegmentMatches(pathTemplateSegments[i]!, pathSegments[i]!)) {
        return undefined
      }
    }

    const requiredQueryParameters = queryParameters.filter((p) => !p.isOptional)
    for (const { parameterName, parameterType } of requiredQueryParameters) {
      const parameterExists = queryParameterExists(parameterName)
      const parameterValue = queryParameterValues[parameterName]
      const parameterIsOfType = valueIsOfType(parameterValue, parameterType)

      if (!parameterExists || !parameterIsOfType) {
        return undefined
      }
    }

    return parseParameterValues()

    function parseParameterValues() {
      const parameters: Record<_ParameterName, _ParameterValueType> = {}

      for (let i = 0; i < pathTemplateSegments.length; i += 1) {
        const template = pathTemplateSegments[i]!

        if (typeof template === 'string') {
          continue
        }

        parameters[template.parameterName] = parseValue(
          pathSegments[i]!,
          template.parameterType,
        )
      }

      for (const { parameterName, parameterType } of queryParameters) {
        if (!queryParameterExists(parameterName)) {
          continue
        }

        parameters[parameterName] = parseValue(
          queryParameterValues[parameterName]!,
          parameterType,
        )
      }

      return parameters
    }
  }

  function pathSegmentMatches(
    template: _RoutePathTemplateSegment,
    segment: _Href,
  ) {
    if (typeof template === 'string') {
      return template === segment
    }

    return valueIsOfType(segment, template.parameterType)
  }

  function queryParameterExists(parameterName: _ParameterName) {
    return Object.prototype.hasOwnProperty.call(
      queryParameterValues,
      parameterName,
    )
  }

  function valueIsOfType(
    rawValue: string | undefined,
    valueType: _ParameterType,
  ): _ParameterValueType {
    if (rawValue === undefined) {
      return true
    }

    if (valueType === 'number') {
      return /^[+-]?\d+(\.\d+)?$/.test(rawValue)
    }

    if (valueType === 'boolean') {
      return rawValue === 'true' || rawValue === 'false'
    }

    return true
  }

  function parseValue(
    rawValue: string,
    valueType: _ParameterType,
  ): _ParameterValueType {
    if (valueType === 'number') {
      return !rawValue ? 0 : parseInt(rawValue, 10)
    }

    if (valueType === 'boolean') {
      return !rawValue ? true : rawValue === 'true'
    }

    return !rawValue ? '' : decodeURIComponent(rawValue)
  }
}

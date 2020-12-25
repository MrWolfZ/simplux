import {
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'
import type { SimpluxRouteId } from '@simplux/router'
import type { _ParameterType, _ParameterValueType } from './parameter.js'
import type { _RoutePathTemplateSegment } from './path.js'
import type { _RouteQueryParameter } from './query.js'

/**
 * Helper type to distinguish url template values.
 *
 * @public
 */
export type _UrlTemplate = string

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
  readonly queryParameters: readonly _RouteQueryParameter[]
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
   * Whether the router is active, i.e. whether it interacts with the
   * browser location mechanism.
   */
  isActive: boolean
}

const initialState: SimpluxBrowserRouterState = {
  routes: [],
  isActive: false,
}

const browserRouterModule = createSimpluxModule('browserRouter', initialState)

const mutations = createMutations(browserRouterModule, {
  addRoute: (
    { routes },
    routeId: SimpluxRouteId,
    urlTemplate: _UrlTemplate,
  ) => {
    const [path, query] = urlTemplate.replace('[?', '?[').split('?')
    const pathTemplateSegments = parsePathTemplate(path!)
    const queryParameters = parseQueryTemplate(query)

    routes[routeId - 1] = {
      pathTemplateSegments,
      queryParameters,
    }
  },
})

const selectors = createSelectors(browserRouterModule, {
  state: (s) => s,

  href: (
    { routes },
    routeId: SimpluxRouteId,
    parameterValues?: Record<string, _ParameterValueType>,
  ) => {
    const { pathTemplateSegments, queryParameters } = routes[routeId - 1]!

    const path = createPathForHref(pathTemplateSegments, parameterValues)
    const query = createQueryForHref(queryParameters, parameterValues)

    return `/${path}${query}`
  },
})

// tslint:disable-next-line:variable-name (internal export)
export const _module = {
  ...browserRouterModule,
  ...mutations,
  ...selectors,
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
): readonly _RouteQueryParameter[] {
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
  ): _RouteQueryParameter {
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
  parameterValues?: Record<string, _ParameterValueType>,
) {
  return segments.map(renderSegment).join('/')

  function renderSegment(segment: _RoutePathTemplateSegment) {
    return typeof segment === 'string'
      ? encodeURIComponent(segment)
      : encodeURIComponent(parameterValues?.[segment.parameterName]!)
  }
}

function createQueryForHref(
  parameters: readonly _RouteQueryParameter[],
  parameterValues?: Record<string, _ParameterValueType>,
) {
  const formattedValues = parameters.map(renderParameter).filter((p) => !!p)

  if (formattedValues.length === 0) {
    return ``
  }

  return `?${formattedValues.join('&')}`

  function renderParameter({ parameterName }: _RouteQueryParameter) {
    const value = parameterValues?.[parameterName]

    if (!value) {
      return ''
    }

    const encodedName = encodeURIComponent(parameterName)
    const encodedValue = encodeURIComponent(value)
    return `${encodedName}=${encodedValue}`
  }
}

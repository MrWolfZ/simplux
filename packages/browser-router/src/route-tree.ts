import type { NavigationParameters, _RouteId } from '@simplux/router'
import type { _Url } from './location.js'
import type {
  _BrowserRouteState,
  _QueryParameterValues,
  _RouteQueryParameterState,
  _UrlTemplate,
} from './module.js'
import type {
  _ParameterName,
  _ParameterType,
  _ParameterValueType,
} from './parameter.js'
import type { _RoutePathTemplateSegment } from './path.js'

/**
 * To efficiently find routes by URL as well as detect conflicts when creating routes,
 * we store them in a tree structure that is based on the path segments of the template.
 *
 * Note that there are no explicit tests for this since it is implicitly tested by
 * the module tests.
 *
 * @internal
 */
export interface _BrowserRouteTreeNode {
  pathTemplateSegment: _RoutePathTemplateSegment
  childNodes: _BrowserRouteTreeNode[]
  routesEndingAtThisSegment: [
    routeId: _RouteId,
    template: _UrlTemplate,
    queryParameters: readonly _RouteQueryParameterState[],
  ][]
}

const rootNode: _BrowserRouteTreeNode = {
  pathTemplateSegment: '',
  childNodes: [],
  routesEndingAtThisSegment: [],
}

function addRoute(
  node: _BrowserRouteTreeNode,
  routeId: _RouteId,
  urlTemplate: _UrlTemplate,
): [_BrowserRouteTreeNode, _BrowserRouteState] {
  urlTemplate = urlTemplate.replace(/^\//, '')
  const [path, query] = urlTemplate.replace('[?', '?[').split('?')
  const pathTemplateSegments = !path ? [] : parsePathTemplate(path!)
  const queryParameters = parseQueryTemplate(query)
  const route = { pathTemplateSegments, queryParameters }

  return [addRouteRecursive(node, routeId, urlTemplate, route, 0), route]
}

function parsePathTemplate(
  template: string,
): readonly _RoutePathTemplateSegment[] {
  return template.replace(/\/$/, '').split('/').map(parseSegment)

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

function addRouteRecursive(
  node: _BrowserRouteTreeNode,
  routeId: _RouteId,
  template: _UrlTemplate,
  route: _BrowserRouteState,
  pathSegmentIndex: number,
): _BrowserRouteTreeNode {
  if (pathSegmentIndex >= route.pathTemplateSegments.length) {
    const routeWithSameParameters = node.routesEndingAtThisSegment.find(
      ([, , params]) =>
        route.queryParameters
          .filter((p) => !p.isOptional)
          .every((p) =>
            params.some((op) => op.parameterName === p.parameterName),
          ),
    )

    if (routeWithSameParameters) {
      if (routeWithSameParameters[0] === routeId) {
        return node
      }

      throw new Error(
        `route with template ${template} conflicts with route with template ${routeWithSameParameters[1]}`,
      )
    }

    return {
      ...node,
      routesEndingAtThisSegment: [
        ...node.routesEndingAtThisSegment,
        [routeId, template, route.queryParameters],
      ],
    }
  }

  const segment = route.pathTemplateSegments[pathSegmentIndex]!
  let childNode = node.childNodes.find((n) =>
    pathSegmentsAreEquivalent(n.pathTemplateSegment, segment),
  )

  let idx = node.childNodes.length

  if (childNode) {
    idx = node.childNodes.indexOf(childNode)
  } else {
    childNode = {
      pathTemplateSegment: segment,
      childNodes: [],
      routesEndingAtThisSegment: [],
    }
  }

  const updatedChildNode = addRouteRecursive(
    childNode,
    routeId,
    template,
    route,
    pathSegmentIndex + 1,
  )

  if (updatedChildNode === childNode) {
    return node
  }

  const updatedChildNodes = [...node.childNodes]
  updatedChildNodes.splice(idx, 1, updatedChildNode)

  return {
    ...node,
    childNodes: updatedChildNodes,
  }
}

function pathSegmentsAreEquivalent(
  left: _RoutePathTemplateSegment,
  right: _RoutePathTemplateSegment,
) {
  if (typeof left === 'string' || typeof right === 'string') {
    return left === right
  }

  return true
}

function findRoute(
  node: _BrowserRouteTreeNode,
  url: _Url,
): [routeId: _RouteId, parameters: NavigationParameters] | undefined {
  const [path, query] = url.split('?')

  const trimmedPath = path!.replace(/^\//, '')

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
    node,
    pathSegments,
    queryParameters || {},
    0,
    {},
  )
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeTree = {
  rootNode,
  addRoute,
  findRoute,
}

function findRouteForPathSegmentsAndQuery(
  { childNodes, routesEndingAtThisSegment }: _BrowserRouteTreeNode,
  pathSegments: _Url[],
  queryParameterValues: _QueryParameterValues,
  pathSegmentIndex: number,
  foundParameters: NavigationParameters,
): [_RouteId, NavigationParameters] | undefined {
  if (pathSegmentIndex >= pathSegments.length) {
    const routes = findRoutesForQuery(
      routesEndingAtThisSegment,
      queryParameterValues,
    )

    for (const route of routes) {
      const [routeId, queryParameters] = route

      for (const { parameterName, parameterType } of queryParameters) {
        if (!queryParameterExists(parameterName)) {
          continue
        }

        foundParameters = {
          ...foundParameters,
          [parameterName]: parseValue(
            queryParameterValues[parameterName]!,
            parameterType,
          ),
        }
      }

      return [routeId, foundParameters]
    }

    return undefined
  }

  const segment = pathSegments[pathSegmentIndex]!
  const childNode = childNodes.find((n) =>
    pathSegmentMatches(n.pathTemplateSegment, segment),
  )

  if (!childNode) {
    return undefined
  }

  if (typeof childNode.pathTemplateSegment !== 'string') {
    const { parameterName, parameterType } = childNode.pathTemplateSegment

    foundParameters = {
      ...foundParameters,
      [parameterName]: parseValue(segment, parameterType),
    }
  }

  tryMatchRoute

  return findRouteForPathSegmentsAndQuery(
    childNode,
    pathSegments,
    queryParameterValues,
    pathSegmentIndex + 1,
    foundParameters,
  )

  function findRoutesForQuery(
    routes: [
      routeId: _RouteId,
      template: _UrlTemplate,
      queryParameters: readonly _RouteQueryParameterState[],
    ][],
    queryParameterValues: _QueryParameterValues,
  ) {
    const results: [_RouteId, readonly _RouteQueryParameterState[]][] = []

    outer: for (const [routeId, _, queryParameters] of routes) {
      const requiredParameters = queryParameters.filter((p) => !p.isOptional)

      for (const { parameterName, parameterType } of requiredParameters) {
        const parameterExists = queryParameterExists(parameterName)
        const parameterValue = queryParameterValues[parameterName]
        const parameterIsOfType = valueIsOfType(parameterValue, parameterType)

        if (!parameterExists || !parameterIsOfType) {
          continue outer
        }
      }

      results.push([routeId, queryParameters])
    }

    // ensure that routes with more query parameters are returned first
    return results.sort((a, b) => b[1].length - a[1].length)
  }

  function tryMatchRoute({
    queryParameters,
  }: _BrowserRouteState): NavigationParameters | undefined {
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
    segment: _Url,
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

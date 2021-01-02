import type { NavigationParameters, _RouteId } from '@simplux/router'
import type { _Url } from './location.js'
import type {
  _ParameterName,
  _ParameterType,
  _ParameterValueType,
} from './parameter.js'

/**
 * Helper type to distinguish url template values.
 *
 * @public
 */
export type _UrlTemplate = string

/**
 * @internal
 */
export type _RoutePathTemplateConstantSegment = string

/**
 * @internal
 */
export interface _RoutePathTemplateParameterSegment {
  readonly parameterName: _ParameterName
  readonly parameterType: _ParameterType
}

/**
 * @internal
 */
export type _RoutePathTemplateSegment =
  | _RoutePathTemplateConstantSegment
  | _RoutePathTemplateParameterSegment

/**
 * @internal
 */
export interface _RouteQueryTemplateParameter {
  readonly parameterName: _ParameterName
  readonly parameterType: _ParameterType
  readonly isOptional: boolean
}

/**
 * @internal
 */
export type _QueryParameterValues = Readonly<
  Record<_ParameterName, string | undefined>
>

/**
 * @internal
 */
export interface _BrowserRouteTemplate {
  readonly pathTemplateSegments: readonly _RoutePathTemplateSegment[]
  readonly queryParameters: readonly _RouteQueryTemplateParameter[]
}

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
    queryParameters: readonly _RouteQueryTemplateParameter[],
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
  template: _BrowserRouteTemplate,
): [_BrowserRouteTreeNode, _BrowserRouteTemplate] {
  try {
    return [addRouteRecursive(node, routeId, template, 0), template]
  } catch (err) {
    if (typeof err !== 'number') {
      throw err
    }

    const routeId = err as _RouteId
    const pathToRoute = findPathToRouteId(node, routeId)!
    const conflictingTemplate = getRouteTemplate(
      node,
      [...pathToRoute],
      routeId,
    )!

    const renderedTemplate = renderTemplate(template)
    const renderedConflictingTemplate = renderTemplate(conflictingTemplate)

    throw new Error(
      `route with template '${renderedTemplate}' conflicts with route with template '${renderedConflictingTemplate}'`,
    )
  }
}

function findRoute(
  node: _BrowserRouteTreeNode,
  url: _Url,
): [routeId: _RouteId, parameters: NavigationParameters] | undefined {
  const [path, query] = url.split('?')

  const trimmedPath = path!.replace(/^\//, '')

  const pathSegments = trimmedPath === '' ? [] : trimmedPath.split('/')

  const queryParameters = query
    ?.split('&')
    .map((p) => p.split('='))
    .reduce((v, [name, value]) => {
      const decodedName = decodeURIComponent(name!)

      if (Object.prototype.hasOwnProperty.call(v, decodedName)) {
        const existingValue = v[decodedName]!
        value = `${existingValue},${value}`
      }

      return { ...v, [decodedName]: value }
    }, {} as _QueryParameterValues)

  return findRouteForPathSegmentsAndQuery(
    node,
    pathSegments,
    queryParameters || {},
    0,
    {},
  )
}

function getFullTemplate(
  node: _BrowserRouteTreeNode,
  parentRouteId: _RouteId | undefined,
  urlTemplate: _UrlTemplate,
): _BrowserRouteTemplate {
  urlTemplate = urlTemplate.replace(/^\//, '')
  const [path, query] = urlTemplate.replace('[?', '?[').split('?')
  const pathTemplateSegments = !path ? [] : parsePathTemplate(path!)
  const queryParameters = parseQueryTemplate(query)
  let route = { pathTemplateSegments, queryParameters }
  const pathToParent = findPathToRouteId(node, parentRouteId) || []
  const parentTemplate = getRouteTemplate(
    node,
    [...pathToParent],
    parentRouteId,
  )

  if (parentTemplate) {
    route = {
      pathTemplateSegments: [
        ...parentTemplate.pathTemplateSegments,
        ...pathTemplateSegments,
      ],
      queryParameters: [...parentTemplate.queryParameters, ...queryParameters],
    }
  }

  return route
}

// tslint:disable-next-line:variable-name (internal export)
export const _routeTree = {
  rootNode,
  addRoute,
  findRoute,
  getFullTemplate,
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
): readonly _RouteQueryTemplateParameter[] {
  if (!template) {
    return []
  }

  const [requiredPart, optionalPart] = template
    .replace('[&', '&[')
    .replace(/^\[/, '&[')
    .split('&[')

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
  ): _RouteQueryTemplateParameter {
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
  route: _BrowserRouteTemplate,
  pathSegmentIndex: number,
): _BrowserRouteTreeNode {
  if (pathSegmentIndex >= route.pathTemplateSegments.length) {
    const routeWithSameParameters = node.routesEndingAtThisSegment.find(
      ([, params]) =>
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

      throw routeWithSameParameters[0]
    }

    return {
      ...node,
      routesEndingAtThisSegment: [
        ...node.routesEndingAtThisSegment,
        [routeId, route.queryParameters],
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
      queryParameters: readonly _RouteQueryTemplateParameter[],
    ][],
    queryParameterValues: _QueryParameterValues,
  ) {
    const results: [_RouteId, readonly _RouteQueryTemplateParameter[]][] = []

    outer: for (const [routeId, queryParameters] of routes) {
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
  }: _BrowserRouteTemplate): NavigationParameters | undefined {
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
      return template === decodeURIComponent(segment)
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
    if (rawValue === undefined || rawValue === '') {
      return true
    }

    const checkString = (_: string) => true

    const checkNumber = (rawValue: string) =>
      /^[+-]?\d+(\.\d+)?$/.test(rawValue)

    const checkBoolean = (rawValue: string) =>
      rawValue === 'true' || rawValue === 'false'

    const checkArray = (rawValue: string, checkValue: (s: string) => boolean) =>
      rawValue.split(',').every(checkValue)

    switch (valueType) {
      case 'string':
        return checkString(rawValue)

      case 'number':
        return checkNumber(rawValue)

      case 'boolean':
        return checkBoolean(rawValue)

      case 'string[]':
        return checkArray(rawValue, checkString)

      case 'number[]':
        return checkArray(rawValue, checkNumber)

      case 'boolean[]':
        return checkArray(rawValue, checkBoolean)

      default:
        assertNever(valueType)
    }
  }

  function parseValue(
    rawValue: string,
    valueType: _ParameterType,
  ): _ParameterValueType {
    const parseString = (rawValue: string) =>
      !rawValue ? '' : decodeURIComponent(rawValue)

    const parseNumber = (rawValue: string) =>
      !rawValue ? 0 : parseInt(rawValue, 10)

    const parseBoolean = (rawValue: string) =>
      !rawValue ? true : rawValue === 'true'

    const parseArray = <T>(rawValue: string, parseValue: (s: string) => T) =>
      !rawValue ? [] : rawValue.split(',').map(parseValue)

    switch (valueType) {
      case 'string':
        return parseString(rawValue)

      case 'number':
        return parseNumber(rawValue)

      case 'boolean':
        return parseBoolean(rawValue)

      case 'string[]':
        return parseArray(rawValue, parseString)

      case 'number[]':
        return parseArray(rawValue, parseNumber)

      case 'boolean[]':
        return parseArray(rawValue, parseBoolean)

      default:
        assertNever(valueType)
    }
  }
}

function findPathToRouteId(
  { childNodes, routesEndingAtThisSegment }: _BrowserRouteTreeNode,
  routeId: _RouteId | undefined,
): readonly number[] | undefined {
  if (!routeId) {
    return undefined
  }

  if (routesEndingAtThisSegment.some(([id]) => id === routeId)) {
    return []
  }

  for (let i = 0; i < childNodes.length; i += 1) {
    const childResult = findPathToRouteId(childNodes[i]!, routeId)

    if (childResult) {
      return [i, ...childResult]
    }
  }

  return undefined
}

function getRouteTemplate(
  {
    childNodes,
    pathTemplateSegment,
    routesEndingAtThisSegment,
  }: _BrowserRouteTreeNode,
  pathToRoute: number[],
  routeId: _RouteId | undefined,
): _BrowserRouteTemplate | undefined {
  if (!routeId) {
    return undefined
  }

  if (pathToRoute.length === 0) {
    const parentQueryParams = routesEndingAtThisSegment.find(
      ([id]) => id === routeId,
    )?.[1]

    if (!parentQueryParams) {
      return undefined
    }

    if (pathTemplateSegment === '') {
      return {
        pathTemplateSegments: [],
        queryParameters: parentQueryParams,
      }
    }

    return {
      pathTemplateSegments: [pathTemplateSegment],
      queryParameters: parentQueryParams,
    }
  }

  const childIdx = pathToRoute.shift()

  const childResult = getRouteTemplate(
    childNodes[childIdx!]!,
    pathToRoute,
    routeId,
  )

  if (!childResult || pathTemplateSegment === '') {
    return childResult
  }

  return {
    ...childResult,
    pathTemplateSegments: [
      pathTemplateSegment,
      ...childResult.pathTemplateSegments,
    ],
  }
}

function renderTemplate({
  pathTemplateSegments,
  queryParameters,
}: _BrowserRouteTemplate) {
  const requiredQueryParams = queryParameters.filter((p) => !p.isOptional)
  const optionalQueryParams = queryParameters.filter((p) => p.isOptional)

  const path = pathTemplateSegments.map(renderPathSegment).join('/')

  let query = ''

  if (requiredQueryParams.length > 0) {
    query = `?${requiredQueryParams.map(renderQueryParameter).join('&')}`
  }

  if (optionalQueryParams.length > 0) {
    query = query ? `${query}[&` : `[?`
    query += `${optionalQueryParams.map(renderQueryParameter).join('&')}]`
  }

  return `${path}${query}`

  function renderPathSegment(segment: _RoutePathTemplateSegment) {
    if (typeof segment === 'string') {
      return segment
    }

    return `:${segment.parameterName}:${segment.parameterType}`
  }

  function renderQueryParameter(parameter: _RouteQueryTemplateParameter) {
    return `${parameter.parameterName}:${parameter.parameterType}`
  }
}

function assertNever(_: never): never {
  throw new Error(`missing case`)
}

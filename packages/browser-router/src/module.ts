import {
  createEffects,
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'
import {
  getSimpluxRouter,
  NavigationParameters,
  NavigationResult,
  NAVIGATION_CANCELLED,
  _RouteId,
} from '@simplux/router'
import { _extractOrigin, _locationModule, _Url } from './location.js'
import type { _ParameterName, _ParameterType } from './parameter.js'
import type { _RoutePathTemplateSegment } from './path.js'
import { _BrowserRouteTreeNode, _routeTree } from './route-tree.js'

const simpluxRouter = getSimpluxRouter()

/**
 * Helper type to distinguish url template values.
 *
 * @internal
 */
export type _UrlTemplate = string

/**
 * @internal
 */
export type _QueryParameterValues = Readonly<
  Record<_ParameterName, string | undefined>
>

/**
 * A query parameter for a route.
 *
 * @internal
 */
export interface _RouteQueryParameterState {
  readonly parameterName: _ParameterName
  readonly parameterType: _ParameterType
  readonly isOptional: boolean
}

/**
 * @internal
 */
export interface _BrowserRouteState {
  readonly pathTemplateSegments: readonly _RoutePathTemplateSegment[]
  readonly queryParameters: readonly _RouteQueryParameterState[]
}

/**
 * @internal
 */
export interface _BrowserRouterState {
  readonly routes: _BrowserRouteState[]
  rootNode: _BrowserRouteTreeNode
  currentNavigationUrl: _Url | undefined
}

const initialState: _BrowserRouterState = {
  routes: [],
  rootNode: _routeTree.rootNode,
  currentNavigationUrl: undefined,
}

const browserRouterModule = createSimpluxModule('browserRouter', initialState)

const mutations = createMutations(browserRouterModule, {
  addRoute: (state, routeId: _RouteId, urlTemplate: _UrlTemplate) => {
    const [updatedTree, route] = _routeTree.addRoute(
      state.rootNode,
      routeId,
      urlTemplate,
    )

    if (updatedTree !== state.rootNode) {
      state.rootNode = updatedTree
      state.routes[routeId - 1] = route
    }
  },

  setCurrentNavigationUrl: (state, url: _Url | undefined) => {
    state.currentNavigationUrl = url
  },
})

const selectors = createSelectors(browserRouterModule, {
  state: (s) => s,

  currentNavigationUrl: ({ currentNavigationUrl }) => currentNavigationUrl,

  href: (
    { routes },
    routeId: _RouteId,
    parameterValues?: NavigationParameters,
  ) => {
    const { pathTemplateSegments, queryParameters } = routes[routeId - 1]!

    const path = createPathForHref(pathTemplateSegments, parameterValues)
    const query = createQueryForHref(queryParameters, parameterValues)

    return `${!path ? '' : '/'}${path}${query}`
  },

  routeIdAndParametersByUrl: (
    { rootNode },
    url: _Url,
  ): [_RouteId, NavigationParameters] | undefined => {
    return _routeTree.findRoute(rootNode as _BrowserRouteTreeNode, url)
  },
})

const effects = createEffects({
  navigateToRouteByUrl: async (url: _Url): NavigationResult => {
    const origin = _extractOrigin(url)

    if (origin && origin !== _locationModule.origin()) {
      throw new Error(`cannot navigate to different origin, got ${origin}`)
    }

    url = url.replace(origin, '')
    url = !url || url === '/' ? '' : url.startsWith('/') ? url : `/${url}`

    if (url === selectors.currentNavigationUrl()) {
      return NAVIGATION_CANCELLED
    }

    const result = selectors.routeIdAndParametersByUrl(url)

    if (result) {
      const [routeId, parameterValues] = result
      return await effects.navigateToRouteByIdAndPushUrl(
        routeId,
        parameterValues,
        url,
      )
    } else {
      throw new Error(`could not find matching route for URL ${url}`)
    }
  },

  navigateToRouteById: async (
    routeId: _RouteId,
    parameterValues?: NavigationParameters,
  ): NavigationResult => {
    const url = selectors.href(routeId, parameterValues)
    return await effects.navigateToRouteByIdAndPushUrl(
      routeId,
      parameterValues,
      url,
    )
  },

  navigateToRouteByIdAndPushUrl: async (
    routeId: _RouteId,
    parameterValues: NavigationParameters | undefined,
    url: _Url,
  ): NavigationResult => {
    mutations.setCurrentNavigationUrl(url)
    const result = await simpluxRouter.navigateToRouteById(
      routeId,
      parameterValues,
    )

    if (result === NAVIGATION_CANCELLED) {
      return NAVIGATION_CANCELLED
    }

    _locationModule.pushNewUrl(url)
    mutations.setCurrentNavigationUrl(undefined)

    return result
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

function createPathForHref(
  segments: readonly _RoutePathTemplateSegment[],
  parameterValues?: NavigationParameters,
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
  parameterValues?: NavigationParameters,
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

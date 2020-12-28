import type { _BrowserRouterState, _BrowserRouteState } from './module.js'

export const emptyRouterState: _BrowserRouterState = {
  routes: [],
  currentNavigationUrl: undefined,
}

export const rootRouteTemplate = '/'

export const rootRoute: _BrowserRouteState = {
  pathTemplateSegments: [],
  queryParameters: [],
}

export const routeTemplateWithoutParameters = 'root'

export const routeStateWithoutParameters: _BrowserRouteState = {
  pathTemplateSegments: ['root'],
  queryParameters: [],
}

export const routeTemplateWithPathParameters =
  'root/:stringParam/intermediate/:numberParam:number/:booleanParam:boolean'

export const routeStateWithPathParameters: _BrowserRouteState = {
  pathTemplateSegments: [
    'root',
    {
      parameterName: 'stringParam',
      parameterType: 'string',
    },
    'intermediate',
    {
      parameterName: 'numberParam',
      parameterType: 'number',
    },
    {
      parameterName: 'booleanParam',
      parameterType: 'boolean',
    },
  ],
  queryParameters: [],
}

export const routeTemplateWithQueryParameters =
  'root?stringParam&numberParam:number&booleanParam:boolean'

export const routeStateWithQueryParameters: _BrowserRouteState = {
  pathTemplateSegments: ['root'],
  queryParameters: [
    {
      parameterName: 'stringParam',
      parameterType: 'string',
      isOptional: false,
    },
    {
      parameterName: 'numberParam',
      parameterType: 'number',
      isOptional: false,
    },
    {
      parameterName: 'booleanParam',
      parameterType: 'boolean',
      isOptional: false,
    },
  ],
}

export const routeTemplateWithOptionalQueryParameter =
  'root?requiredParam[&optionalParam]'

export const routeStateWithOptionalQueryParameters: _BrowserRouteState = {
  pathTemplateSegments: ['root'],
  queryParameters: [
    {
      parameterName: 'requiredParam',
      parameterType: 'string',
      isOptional: false,
    },
    {
      parameterName: 'optionalParam',
      parameterType: 'string',
      isOptional: true,
    },
  ],
}

export const routeTemplateWithOnlyOptionalQueryParameter =
  'root[?optionalParam]'

export interface RouteWithPathAndQueryParametersPathPart {
  pathStringParam: string
  pathNumberParam: number
}

export interface RouteWithPathAndQueryParametersQueryPart {
  queryStringParam: string
  queryNumberParam: number
}

export const routeTemplateWithPathAndQueryParameters =
  'root/:pathStringParam/intermediate/:pathNumberParam:number?queryStringParam&queryNumberParam:number'

export const routeStateWithPathAndQueryParameters: _BrowserRouteState = {
  pathTemplateSegments: [
    'root',
    {
      parameterName: 'pathStringParam',
      parameterType: 'string',
    },
    'intermediate',
    {
      parameterName: 'pathNumberParam',
      parameterType: 'number',
    },
  ],
  queryParameters: [
    {
      parameterName: 'queryStringParam',
      parameterType: 'string',
      isOptional: false,
    },
    {
      parameterName: 'queryNumberParam',
      parameterType: 'number',
      isOptional: false,
    },
  ],
}

export const routeTemplateWithOnNavigateTo = 'root/withOnNavigateTo'
export const routeTemplateWithOnNavigateToAndParameters =
  'root/withOnNavigateTo/:pathParam?queryParam'
export const routeTemplateForCancellation = 'root/forCancellation'
export const routeTemplateThatCancelsNav = 'root/cancelsNav'

export function makeBrowserRouterState(
  ...routes: _BrowserRouteState[]
): _BrowserRouterState {
  return {
    routes,
    currentNavigationUrl: undefined,
  }
}

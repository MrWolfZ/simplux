import type {
  SimpluxBrowserRouterState,
  SimpluxBrowserRouteState,
} from './module.js'

export const emptyRouterState: SimpluxBrowserRouterState = {
  routes: [],
  currentNavigationUrl: undefined,
}

export const rootRouteTemplate = '/'

export const rootRoute: SimpluxBrowserRouteState = {
  pathTemplateSegments: [],
  queryParameters: [],
}

export const routeTemplateWithoutParameters = 'root'

export const routeStateWithoutParameters: SimpluxBrowserRouteState = {
  pathTemplateSegments: ['root'],
  queryParameters: [],
}

export const routeTemplateWithPathParameters =
  'root/:stringParam/intermediate/:numberParam:number/:booleanParam:boolean'

export const routeStateWithPathParameters: SimpluxBrowserRouteState = {
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

export const routeStateWithQueryParameters: SimpluxBrowserRouteState = {
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

export const routeStateWithOptionalQueryParameters: SimpluxBrowserRouteState = {
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

export const routeStateWithPathAndQueryParameters: SimpluxBrowserRouteState = {
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

export function makeBrowserRouterState(
  ...routes: SimpluxBrowserRouteState[]
): SimpluxBrowserRouterState {
  return {
    routes,
    currentNavigationUrl: undefined,
  }
}

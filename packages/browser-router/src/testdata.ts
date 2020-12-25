import type {
  SimpluxBrowserRouterState,
  SimpluxBrowserRouteState,
} from './module.js'

export const emptyRouterState: SimpluxBrowserRouterState = {
  routes: [],
  isActive: false,
}

export const rootRouteTemplate = 'root'

export const rootRoute: SimpluxBrowserRouteState = {
  pathTemplateSegments: [],
  queryParameters: [],
}

export const routeTemplateWithoutParameters = 'root'

export const routeStateWithoutParameters: SimpluxBrowserRouteState = {
  pathTemplateSegments: ['root'],
  queryParameters: [],
}

export interface RouteWithPathParameters {
  stringParam: string
  numberParam: number
  booleanParam: boolean
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

export interface RouteWithQueryParameters {
  stringParam: string
  numberParam: number
  booleanParam: boolean
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

export interface RouteWithOptionalQueryParameter {
  requiredParam: string
  optionalParam?: string
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

export interface RouteWithPathAndQueryParameters
  extends RouteWithPathAndQueryParametersPathPart,
    RouteWithPathAndQueryParametersQueryPart {}

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

export function makeBrowserRouterState(
  ...routes: SimpluxBrowserRouteState[]
): SimpluxBrowserRouterState {
  return {
    routes,
    isActive: false,
  }
}

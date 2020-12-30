import type { _BrowserRouterState } from './module.js'
import { _routeTree } from './route-tree.js'

export const emptyRouterState: _BrowserRouterState = {
  templates: [],
  rootNode: _routeTree.rootNode,
  currentNavigationUrl: undefined,
}

export const rootRouteTemplate = '/'

export const routeTemplateWithoutParameters = 'root'

export const routeTemplateWithPathParameters =
  'root/:stringParam/intermediate/:numberParam:number/:booleanParam:boolean/:arrayStringParam:string[]/:arrayNumberParam:number[]'

export const routeTemplateWithQueryParameters =
  'root?stringParam&numberParam:number&booleanParam:boolean&arrayStringParam:string[]&arrayNumberParam:number[]'

export const routeTemplateWithOptionalQueryParameter =
  'root/withRequiredQuery?requiredParam[&optionalParam]'

export const routeTemplateWithOnlyOptionalQueryParameter =
  'root/withOptionalQuery[?optionalParam]'

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

export const routeTemplateWithOnNavigateTo = 'root/withOnNavigateTo'
export const routeTemplateWithOnNavigateToAndParameters =
  'root/withOnNavigateTo/:pathParam?queryParam'

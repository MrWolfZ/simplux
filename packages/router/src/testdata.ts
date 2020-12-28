import type { _RouterState, _RouteState } from './module.js'

export const routeName1 = 'testRoute1'
export const routeName2 = 'testRoute2'
export const routeName3 = 'testRoute3'

export const emptyRouterState: _RouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
  navigationIsInProgress: false,
}

export const routeState1: _RouteState = {
  name: routeName1,
}

export const routeState2: _RouteState = {
  name: routeName2,
}

export interface RouteParameters3 {
  str: string
  num: number
  bool: boolean
  opt?: string
}

export const routeState3: _RouteState = {
  name: routeName3,
}

export const routerStateWithRoute1: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1],
}

export const routerStateWithRoute2: _RouterState = {
  ...emptyRouterState,
  routes: [routeState2],
}

export const routerStateWithTwoRoutes: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1, routeState2],
}

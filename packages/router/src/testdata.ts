import type { _RouterState, _RouteState } from './module.js'

export const routeName1 = 'testRoute1'
export const routeName2 = 'testRoute2'
export const routeName3 = 'testRoute3'

export const emptyRouterState: _RouterState = {
  routes: [],
  activeRouteIds: undefined,
  activeRouteParameterValues: {},
  navigationIsInProgress: false,
}

export const routeState1: _RouteState = {
  name: routeName1,
  parentRouteId: undefined,
}

export const routeState2: _RouteState = {
  name: routeName2,
  parentRouteId: undefined,
}

export const childRouteState1: _RouteState = {
  name: routeName2,
  parentRouteId: 1,
}

export const childRouteState2: _RouteState = {
  name: routeName3,
  parentRouteId: 1,
}

export interface RouteParameters3 {
  str: string
  num: number
  bool: boolean
  opt?: string
}

export const routeState3: _RouteState = {
  name: routeName3,
  parentRouteId: undefined,
}

export const routerStateWithRoute1: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1],
}

export const routerStateWithRoute1AndChild1: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1, childRouteState1],
}

export const routerStateWithRoute1AndChild1AndChild2: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1, childRouteState1, childRouteState2],
}

export const routerStateWithRoute2: _RouterState = {
  ...emptyRouterState,
  routes: [routeState2],
}

export const routerStateWithTwoRoutes: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1, routeState2],
}

export const routerStateWithTwoRoutesAndOneChild: _RouterState = {
  ...emptyRouterState,
  routes: [routeState1, routeState2, childRouteState1],
}

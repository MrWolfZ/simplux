import type { SimpluxRouterState, SimpluxRouteState } from './module.js'

export const routeName1 = 'testRoute1'
export const routeName2 = 'testRoute2'
export const routeName3 = 'testRoute3'

export const emptyRouterState: SimpluxRouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
  navigationIsInProgress: false,
}

export const routeState1: SimpluxRouteState = {
  name: routeName1,
}

export const routeState2: SimpluxRouteState = {
  name: routeName2,
}

export interface RouteParameters3 {
  str: string
  num: number
  bool: boolean
  opt?: string
}

export const routeState3: SimpluxRouteState = {
  name: routeName3,
}

export const routerStateWithRoute1: SimpluxRouterState = {
  ...emptyRouterState,
  routes: [routeState1],
}

export const routerStateWithRoute2: SimpluxRouterState = {
  ...emptyRouterState,
  routes: [routeState2],
}

export const routerStateWithTwoRoutes: SimpluxRouterState = {
  ...emptyRouterState,
  routes: [routeState1, routeState2],
}

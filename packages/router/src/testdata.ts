import type { SimpluxRouterState, SimpluxRouteState } from './module.js'

export const routeName1 = 'testRoute1'
export const routeName2 = 'testRoute2'

export const emptyRouterState: SimpluxRouterState = {
  routes: [],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
}

export const routeState1: SimpluxRouteState = {
  name: routeName1,
  parameterDefaults: {},
}

export const routeState2: SimpluxRouteState = {
  name: routeName2,
  parameterDefaults: {
    stringParam: 'string',
    numberParam: 100,
    booleanParam: true,
  },
}

export const routerStateWithRoute1: SimpluxRouterState = {
  routes: [routeState1],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
}

export const routerStateWithRoute2: SimpluxRouterState = {
  routes: [routeState2],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
}

export const routerStateWithTwoRoutes: SimpluxRouterState = {
  routes: [routeState1, routeState2],
  activeRouteId: undefined,
  activeRouteParameterValues: {},
}
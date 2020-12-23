import type { SimpluxRouterState, SimpluxRouteState } from './module.js'

export const routeName1 = 'testRoute1'
export const routeName2 = 'testRoute2'

export const emptyRouterState: SimpluxRouterState = {
  routes: [],
}

export const routeState1: SimpluxRouteState = {
  name: routeName1,
  parameterDefaults: {},
  isActive: false,
  parameterValues: {},
}

export const routeState2: SimpluxRouteState = {
  name: routeName2,
  parameterDefaults: {
    stringParam: 'string',
    numberParam: 100,
    booleanParam: true,
  },
  isActive: false,
  parameterValues: {},
}

export const routerStateWithRoute1: SimpluxRouterState = {
  routes: [routeState1],
}

export const routerStateWithRoute2: SimpluxRouterState = {
  routes: [routeState2],
}

export const routerStateWithTwoRoutes: SimpluxRouterState = {
  routes: [routeState1, routeState2],
}

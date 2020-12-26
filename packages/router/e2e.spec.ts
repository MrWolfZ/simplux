// this file contains an end-to-end test for the public API

import { getSimpluxRouter } from '@simplux/router'
import {
  emptyRouterState,
  routeName1,
  routeName2,
  routeName3,
  RouteParameters3,
  routerStateWithRoute1,
  routerStateWithTwoRoutes,
} from './src/testdata.js'

describe(`@simplux/router`, () => {
  it('works', () => {
    const router = getSimpluxRouter()

    expect(router.state()).toEqual(emptyRouterState)

    const testRoute1 = router.addRoute(routeName1)

    expect(testRoute1.name).toBe(routeName1)
    expect(router.state()).toEqual(routerStateWithRoute1)

    const testRoute2 = router.addRoute(routeName2, {})

    expect(testRoute2.name).toBe(routeName2)
    expect(router.state()).toEqual(routerStateWithTwoRoutes)

    const testRoute3 = router.addRoute<RouteParameters3>(routeName3)

    expect(testRoute3.name).toBe(routeName3)

    expect(router.anyRouteIsActive()).toBe(false)

    testRoute1.navigateTo()

    expect(testRoute1.isActive()).toBe(true)
    expect(testRoute1.parameterValues()).toEqual({})

    expect(router.anyRouteIsActive()).toBe(true)

    testRoute2.navigateTo()

    expect(testRoute2.isActive()).toBe(true)
    expect(testRoute2.parameterValues()).toEqual({})

    testRoute3.navigateTo({
      str: 'a',
      num: 1,
      bool: false,
    })

    expect(testRoute3.isActive()).toBe(true)
    expect(testRoute3.parameterValues()).toEqual({
      str: 'a',
      num: 1,
      bool: false,
    })

    router.navigateToRouteById(testRoute1.id)

    expect(testRoute1.isActive()).toBe(true)
    expect(testRoute1.parameterValues()).toEqual({})

    router.navigateToRouteById(testRoute3.id, {
      str: 'a',
      num: 1,
      bool: false,
    })

    expect(testRoute3.isActive()).toBe(true)
    expect(testRoute3.parameterValues()).toEqual({
      str: 'a',
      num: 1,
      bool: false,
    })
  })
})

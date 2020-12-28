// this file contains an end-to-end test for the public API

import { getSimpluxRouter, NAVIGATION_CANCELLED } from '@simplux/router'
import { NAVIGATION_FINISHED } from './src/module.js'
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
  it('works', async () => {
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

    const testRoute4 = router.addRoute('async', {
      onNavigateTo: async () => {
        await Promise.resolve()
      },
    })

    await testRoute4.onNavigateTo()

    const testRoute5 = router.addRoute<{ param: string }>('asyncParams', {
      onNavigateTo: async ({ param }) => {
        expect(param).toBe('value')
        await Promise.resolve()
      },
    })

    await testRoute5.onNavigateTo!({ param: 'value' }, undefined!)

    let cancelledNavigation = new Promise<typeof NAVIGATION_CANCELLED>(() => {})
    const testRoute6 = router.addRoute('asyncNever', {
      onNavigateTo: (_, { cancelled }) => {
        cancelledNavigation = cancelled
        return new Promise<void>(() => {})
      },
    })

    expect(router.anyRouteIsActive()).toBe(false)

    await testRoute1.navigateTo()

    expect(testRoute1.isActive()).toBe(true)
    expect(testRoute1.parameterValues()).toEqual({})

    expect(router.anyRouteIsActive()).toBe(true)

    await testRoute2.navigateTo()

    expect(testRoute2.isActive()).toBe(true)
    expect(testRoute2.parameterValues()).toEqual({})

    await testRoute3.navigateTo({
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

    await testRoute4.navigateTo()
    expect(testRoute4.isActive()).toBe(true)

    await testRoute5.navigateTo({ param: 'value' })

    expect(testRoute5.isActive()).toBe(true)
    expect(testRoute5.parameterValues()).toEqual({ param: 'value' })

    await router.navigateToRouteById(testRoute1.id)

    expect(testRoute1.isActive()).toBe(true)
    expect(testRoute1.parameterValues()).toEqual({})

    await router.navigateToRouteById(testRoute3.id, {
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

    const navToCancel = testRoute6.navigateTo()

    expect(testRoute6.isActive()).toBe(false)
    expect(router.navigationIsInProgress()).toBe(true)

    const finishedNav = testRoute1.navigateTo()

    await expect(finishedNav).resolves.toBe(NAVIGATION_FINISHED)
    await expect(cancelledNavigation).resolves.toBe(NAVIGATION_CANCELLED)
    await expect(navToCancel).resolves.toBe(NAVIGATION_CANCELLED)

    expect(testRoute6.isActive()).toBe(false)
    expect(testRoute1.isActive()).toBe(true)
    expect(router.navigationIsInProgress()).toBe(false)
  })
})

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

    const asyncRoute = router.addRoute('async', {
      onNavigateTo: async () => {
        await Promise.resolve()
      },
    })

    await asyncRoute.onNavigateTo()

    const asyncRouteWithParams = router.addRoute<{ param: string }>(
      'asyncParams',
      {
        onNavigateTo: async ({ param }) => {
          expect(param).toBe('value')
          await Promise.resolve()
        },
      },
    )

    await asyncRouteWithParams.onNavigateTo!({ param: 'value' }, undefined!)

    let cancelledNavigation = new Promise<typeof NAVIGATION_CANCELLED>(() => {})
    const cancelledNavRoute = router.addRoute('asyncNever', {
      onNavigateTo: (_, { cancelled }) => {
        cancelledNavigation = cancelled
        return new Promise<void>(() => {})
      },
    })

    // tslint:disable-next-line: no-floating-promises
    cancelledNavRoute.onNavigateTo(
      {},
      {
        cancelled: undefined!,
        cancelNavigation: NAVIGATION_CANCELLED,
        navigationIsToChildRoute: false,
      },
    )

    const routeThatCancelsNav = router.addRoute('asyncCancel', {
      onNavigateTo: (_, { cancelNavigation }) => {
        return Promise.resolve(cancelNavigation)
      },
    })

    await routeThatCancelsNav.onNavigateTo(
      {},
      {
        cancelled: undefined!,
        cancelNavigation: NAVIGATION_CANCELLED,
        navigationIsToChildRoute: false,
      },
    )

    const routeThatCancelsNavIfActive = router.addRoute('asyncCancelIfActive', {
      onNavigateTo: (_, { cancelNavigation }) => {
        if (routeThatCancelsNavIfActive.isActive()) {
          return Promise.resolve(cancelNavigation)
        }
      },
    })

    const routeThatRedirectsNavSync = router.addRoute('syncRedirect', {
      onNavigateTo: () => testRoute1.navigateTo(),
    })

    const routeThatRedirectsNavAsync = router.addRoute('asyncRedirect', {
      onNavigateTo: async () => {
        await Promise.resolve()
        return testRoute2.navigateTo()
      },
    })

    const routeThatThrowsSync = router.addRoute('syncThrow', {
      onNavigateTo: () => {
        throw new Error()
      },
    })

    const routeThatThrowsAsync = router.addRoute('asyncThrow', {
      onNavigateTo: async () => {
        await Promise.resolve()
        throw new Error()
      },
    })

    const parentRoute = router.addRoute<{ parent: string }>('parent', {
      onNavigateTo: async ({ parent }, { navigationIsToChildRoute }) => {
        expect(navigationIsToChildRoute).toBe(parent !== 'direct')
        await Promise.resolve()
      },
    })

    const childRoute1 = parentRoute.addChildRoute<{ child1: string }>(
      'child1',
      {
        onNavigateTo: async (
          { parent, child1 },
          { navigationIsToChildRoute },
        ) => {
          parent
          child1
          navigationIsToChildRoute
          await Promise.resolve()
        },
      },
    )

    const childRoute2 = parentRoute.addChildRoute<{ child2: string }>(
      'child2',
      {
        onNavigateTo: async (
          { parent, child2 },
          { navigationIsToChildRoute },
        ) => {
          parent
          child2
          navigationIsToChildRoute
          await Promise.resolve()
        },
      },
    )

    const nestedChildRoute1 = childRoute1.addChildRoute<{ nested: string }>(
      'nestedChild1',
      {
        onNavigateTo: async (
          { parent, child1, nested },
          { navigationIsToChildRoute },
        ) => {
          parent
          child1
          nested
          navigationIsToChildRoute
          await Promise.resolve()
        },
      },
    )

    const cancellingChildRoute = parentRoute.addChildRoute('cancellingChild', {
      onNavigateTo: (_, { cancelNavigation }) => {
        return Promise.resolve(cancelNavigation)
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

    await asyncRoute.navigateTo()
    expect(asyncRoute.isActive()).toBe(true)

    await asyncRouteWithParams.navigateTo({ param: 'value' })

    expect(asyncRouteWithParams.isActive()).toBe(true)
    expect(asyncRouteWithParams.parameterValues()).toEqual({ param: 'value' })

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

    const navToCancel = cancelledNavRoute.navigateTo()

    expect(cancelledNavRoute.isActive()).toBe(false)
    expect(router.navigationIsInProgress()).toBe(true)

    const finishedNav = testRoute1.navigateTo()

    expect(router.navigationIsInProgress()).toBe(true)

    await expect(finishedNav).resolves.toBe(NAVIGATION_FINISHED)
    expect(router.navigationIsInProgress()).toBe(false)

    await expect(cancelledNavigation).resolves.toBe(NAVIGATION_CANCELLED)
    await expect(navToCancel).resolves.toBe(NAVIGATION_CANCELLED)

    expect(cancelledNavRoute.isActive()).toBe(false)
    expect(testRoute1.isActive()).toBe(true)
    expect(router.navigationIsInProgress()).toBe(false)

    const cancelledNav = routeThatCancelsNav.navigateTo()
    await expect(cancelledNav).resolves.toBe(NAVIGATION_CANCELLED)

    const shouldFinish = routeThatCancelsNavIfActive.navigateTo()
    await expect(shouldFinish).resolves.toBe(NAVIGATION_FINISHED)
    expect(routeThatCancelsNavIfActive.isActive()).toBe(true)

    const shouldCancel = routeThatCancelsNavIfActive.navigateTo()
    await expect(shouldCancel).resolves.toBe(NAVIGATION_CANCELLED)
    expect(router.navigationIsInProgress()).toBe(false)

    const redirectedCancelSync = routeThatRedirectsNavSync.navigateTo()
    await expect(redirectedCancelSync).resolves.toBe(NAVIGATION_CANCELLED)
    expect(routeThatRedirectsNavSync.isActive()).toBe(false)
    expect(testRoute1.isActive()).toBe(true)

    const redirectedCancelAsync = routeThatRedirectsNavAsync.navigateTo()
    await expect(redirectedCancelAsync).resolves.toBe(NAVIGATION_CANCELLED)
    expect(routeThatRedirectsNavAsync.isActive()).toBe(false)
    expect(testRoute2.isActive()).toBe(true)

    const syncThrowNav = routeThatThrowsSync.navigateTo()
    await expect(syncThrowNav).rejects.toBeDefined()
    expect(router.navigationIsInProgress()).toBe(false)

    const asyncThrowNav = routeThatThrowsAsync.navigateTo()
    await expect(asyncThrowNav).rejects.toBeDefined()
    expect(router.navigationIsInProgress()).toBe(false)

    await parentRoute.navigateTo({ parent: 'direct' })
    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({ parent: 'direct' })
    expect(childRoute1.isActive()).toBe(false)
    expect(childRoute2.isActive()).toBe(false)
    expect(nestedChildRoute1.isActive()).toBe(false)

    await childRoute1.navigateTo({ parent: 'parent', child1: 'child' })
    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parent: 'parent',
      child1: 'child',
    })
    expect(childRoute1.isActive()).toBe(true)
    expect(childRoute1.parameterValues()).toEqual({
      parent: 'parent',
      child1: 'child',
    })
    expect(childRoute2.isActive()).toBe(false)
    expect(nestedChildRoute1.isActive()).toBe(false)

    await childRoute2.navigateTo({ parent: 'parent', child2: 'child' })
    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parent: 'parent',
      child2: 'child',
    })
    expect(childRoute1.isActive()).toBe(false)
    expect(childRoute2.isActive()).toBe(true)
    expect(childRoute2.parameterValues()).toEqual({
      parent: 'parent',
      child2: 'child',
    })
    expect(nestedChildRoute1.isActive()).toBe(false)

    await nestedChildRoute1.navigateTo({
      parent: 'parent',
      child1: 'child',
      nested: 'nested',
    })

    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parent: 'parent',
      child1: 'child',
      nested: 'nested',
    })
    expect(childRoute1.isActive()).toBe(true)
    expect(childRoute1.parameterValues()).toEqual({
      parent: 'parent',
      child1: 'child',
      nested: 'nested',
    })
    expect(childRoute2.isActive()).toBe(false)
    expect(nestedChildRoute1.isActive()).toBe(true)
    expect(nestedChildRoute1.parameterValues()).toEqual({
      parent: 'parent',
      child1: 'child',
      nested: 'nested',
    })

    const canceledNavFromChild = cancellingChildRoute.navigateTo({
      parent: 'parent',
    })

    await expect(canceledNavFromChild).resolves.toBe(NAVIGATION_CANCELLED)
    expect(router.navigationIsInProgress()).toBe(false)
  })
})

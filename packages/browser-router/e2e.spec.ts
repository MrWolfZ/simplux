// this file contains an end-to-end test for the public API

import {
  getSimpluxBrowserRouter,
  NAVIGATION_CANCELLED,
  NAVIGATION_FINISHED,
} from '@simplux/browser-router'
import {
  emptyRouterState,
  rootRouteTemplate,
  routeTemplateWithOnlyOptionalQueryParameter,
  routeTemplateWithOnNavigateTo,
  routeTemplateWithOnNavigateToAndParameters,
  routeTemplateWithOptionalQueryParameter,
  routeTemplateWithoutParameters,
  routeTemplateWithPathAndQueryParameters,
  routeTemplateWithPathParameters,
  routeTemplateWithQueryParameters,
} from './src/testdata.js'

describe(`@simplux/browser-router`, () => {
  it('works', async () => {
    const router = getSimpluxBrowserRouter()

    expect(router.state()).toEqual(emptyRouterState)

    const rootRoute = router.addRoute(rootRouteTemplate)
    expect(rootRoute.name).toBe(rootRouteTemplate)

    const routeWithoutParameters = router.addRoute(
      routeTemplateWithoutParameters,
    )

    expect(routeWithoutParameters.name).toBe(routeTemplateWithoutParameters)

    const routeWithPathParameters = router.addRoute(
      routeTemplateWithPathParameters,
    )

    expect(routeWithPathParameters.name).toBe(routeTemplateWithPathParameters)

    const routeWithQueryParameters = router.addRoute(
      routeTemplateWithQueryParameters,
    )

    expect(routeWithQueryParameters.name).toBe(routeTemplateWithQueryParameters)

    const routeWithOptionalQueryParameter = router.addRoute(
      routeTemplateWithOptionalQueryParameter,
    )

    expect(routeWithOptionalQueryParameter.name).toBe(
      routeTemplateWithOptionalQueryParameter,
    )

    const routeWithOnlyOptionalQueryParameter = router.addRoute(
      routeTemplateWithOnlyOptionalQueryParameter,
    )

    expect(routeWithOnlyOptionalQueryParameter.name).toBe(
      routeTemplateWithOnlyOptionalQueryParameter,
    )

    const routeWithPathAndQueryParameters = router.addRoute(
      routeTemplateWithPathAndQueryParameters,
    )

    expect(routeWithPathAndQueryParameters.name).toBe(
      routeTemplateWithPathAndQueryParameters,
    )

    const routeWithOnNavigateTo = router.addRoute(
      routeTemplateWithOnNavigateTo,
      {
        onNavigateTo: async () => {
          await Promise.resolve()
        },
      },
    )

    await routeWithOnNavigateTo.onNavigateTo()

    const routeWithOnNavigateToAndParameters = router.addRoute(
      routeTemplateWithOnNavigateToAndParameters,
      {
        onNavigateTo: async ({ pathParam, queryParam }) => {
          expect(pathParam).toBe('pathValue')
          expect(queryParam).toBe('queryValue')
          await Promise.resolve()
        },
      },
    )

    await routeWithOnNavigateToAndParameters.onNavigateTo({
      pathParam: 'pathValue',
      queryParam: 'queryValue',
    })

    let cancelledNavigation = new Promise<typeof NAVIGATION_CANCELLED>(() => {})
    const routeForCancellation = router.addRoute('root/forCancellation', {
      onNavigateTo: async (_, { cancelled }) => {
        cancelledNavigation = cancelled
        await new Promise<typeof NAVIGATION_CANCELLED>(() => {})
      },
    })

    // tslint:disable-next-line: no-floating-promises
    routeForCancellation.onNavigateTo(
      {},
      { cancelled: undefined!, cancelNavigation: NAVIGATION_CANCELLED },
    )

    const routeThatCancelsNav = router.addRoute('root/cancelsNav', {
      onNavigateTo: (_, { cancelNavigation }) => {
        return Promise.resolve(cancelNavigation)
      },
    })

    await routeThatCancelsNav.onNavigateTo(
      {},
      { cancelled: undefined!, cancelNavigation: NAVIGATION_CANCELLED },
    )

    const routeThatThrowsSync = router.addRoute('root/syncThrow', {
      onNavigateTo: () => {
        throw new Error()
      },
    })

    const routeThatThrowsAsync = router.addRoute('root/asyncThrow', {
      onNavigateTo: async () => {
        await Promise.resolve()
        throw new Error()
      },
    })

    const parentRoute = router.addRoute(
      'parent/:parentParam?parentQueryParam',
      {
        onNavigateTo: async ({ parentParam, parentQueryParam }) => {
          parentParam
          parentQueryParam
          await Promise.resolve()
        },
      },
    )

    expect(
      parentRoute.href({
        parentParam: 'parent',
        parentQueryParam: 'parent',
      }),
    ).toBe('/parent/parent?parentQueryParam=parent')

    const childRoute1 = parentRoute.addChildRoute(
      'child1/:child1Param?childQueryParam1',
      {
        onNavigateTo: async ({
          parentParam,
          parentQueryParam,
          child1Param,
          childQueryParam1,
        }) => {
          parentParam
          parentQueryParam
          child1Param
          childQueryParam1
          await Promise.resolve()
        },
      },
    )

    expect(
      childRoute1.href({
        parentParam: 'parent',
        parentQueryParam: 'parent',
        child1Param: 'child1',
        childQueryParam1: 'child1',
      }),
    ).toBe(
      '/parent/parent/child1/child1?parentQueryParam=parent&childQueryParam1=child1',
    )

    const childRoute2 = parentRoute.addChildRoute(
      'child2/:child2Param:number?childQueryParam2:number',
      {
        onNavigateTo: async ({
          parentParam,
          parentQueryParam,
          child2Param,
          childQueryParam2,
        }) => {
          parentParam
          parentQueryParam
          child2Param
          childQueryParam2
          await Promise.resolve()
        },
      },
    )

    expect(
      childRoute2.href({
        parentParam: 'parent',
        parentQueryParam: 'parent',
        child2Param: 100,
        childQueryParam2: -100,
      }),
    ).toBe(
      '/parent/parent/child2/100?parentQueryParam=parent&childQueryParam2=-100',
    )

    const nestedChildRoute = childRoute1.addChildRoute(
      'nested/:nestedChildParam?nestedChildQueryParam',
      {
        onNavigateTo: async ({
          parentParam,
          parentQueryParam,
          child1Param,
          childQueryParam1,
          nestedChildParam,
          nestedChildQueryParam,
        }) => {
          parentParam
          parentQueryParam
          child1Param
          childQueryParam1
          nestedChildParam
          nestedChildQueryParam
          await Promise.resolve()
        },
      },
    )

    expect(
      nestedChildRoute.href({
        parentParam: 'parent',
        parentQueryParam: 'parent',
        child1Param: 'child1',
        childQueryParam1: 'child1',
        nestedChildParam: 'nested',
        nestedChildQueryParam: 'nested',
      }),
    ).toBe(
      '/parent/parent/child1/child1/nested/nested?parentQueryParam=parent&childQueryParam1=child1&nestedChildQueryParam=nested',
    )

    expect(router.anyRouteIsActive()).toBe(false)

    await rootRoute.navigateTo()

    expect(rootRoute.isActive()).toBe(true)
    expect(rootRoute.parameterValues()).toEqual({})
    expect(rootRoute.href()).toBe('')

    expect(router.anyRouteIsActive()).toBe(true)

    await routeWithoutParameters.navigateTo()

    expect(routeWithoutParameters.isActive()).toBe(true)
    expect(routeWithoutParameters.parameterValues()).toEqual({})
    expect(routeWithoutParameters.href()).toBe('/root')

    await routeWithPathParameters.navigateTo({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
      arrayStringParam: ['b', 'c', 'long'],
      arrayNumberParam: [100, -100, 9999999999],
    })

    expect(routeWithPathParameters.isActive()).toBe(true)
    expect(routeWithPathParameters.parameterValues()).toEqual({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
      arrayStringParam: ['b', 'c', 'long'],
      arrayNumberParam: [100, -100, 9999999999],
    })
    expect(
      routeWithPathParameters.href({
        stringParam: 'a',
        numberParam: 1,
        booleanParam: false,
        arrayStringParam: ['b', 'c', 'long'],
        arrayNumberParam: [100, -100, 9999999999],
      }),
    ).toBe('/root/a/intermediate/1/false/b,c,long/100,-100,9999999999')

    await routeWithQueryParameters.navigateTo({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
      arrayStringParam: ['b', 'c', 'long'],
      arrayNumberParam: [100, -100, 9999999999],
    })

    expect(routeWithQueryParameters.isActive()).toBe(true)
    expect(routeWithQueryParameters.parameterValues()).toEqual({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
      arrayStringParam: ['b', 'c', 'long'],
      arrayNumberParam: [100, -100, 9999999999],
    })
    expect(
      routeWithQueryParameters.href({
        stringParam: 'a',
        numberParam: 1,
        booleanParam: false,
        arrayStringParam: ['b', 'c', 'long'],
        arrayNumberParam: [100, -100, 9999999999],
      }),
    ).toBe(
      '/root?stringParam=a&numberParam=1&booleanParam=false&arrayStringParam=b,c,long&arrayNumberParam=100,-100,9999999999',
    )

    await routeWithOptionalQueryParameter.navigateTo({
      requiredParam: 'a',
    })

    expect(routeWithOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOptionalQueryParameter.parameterValues()).toEqual({
      requiredParam: 'a',
    })
    expect(routeWithOptionalQueryParameter.href({ requiredParam: 'a' })).toBe(
      '/root/withRequiredQuery?requiredParam=a',
    )
    expect(
      routeWithOptionalQueryParameter.href({
        requiredParam: 'a',
        optionalParam: 'b',
      }),
    ).toBe('/root/withRequiredQuery?requiredParam=a&optionalParam=b')

    await routeWithOnlyOptionalQueryParameter.navigateTo()

    expect(routeWithOnlyOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOnlyOptionalQueryParameter.parameterValues()).toEqual({})
    expect(routeWithOnlyOptionalQueryParameter.href()).toBe(
      '/root/withOptionalQuery',
    )

    await routeWithOnlyOptionalQueryParameter.navigateTo({
      optionalParam: 'opt',
    })

    expect(routeWithOnlyOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOnlyOptionalQueryParameter.parameterValues()).toEqual({
      optionalParam: 'opt',
    })
    expect(
      routeWithOnlyOptionalQueryParameter.href({ optionalParam: 'opt' }),
    ).toBe('/root/withOptionalQuery?optionalParam=opt')

    await routeWithPathAndQueryParameters.navigateTo({
      pathStringParam: 'path',
      pathNumberParam: 100,
      queryStringParam: 'query',
      queryNumberParam: -100,
    })

    expect(routeWithPathAndQueryParameters.isActive()).toBe(true)
    expect(routeWithPathAndQueryParameters.parameterValues()).toEqual({
      pathStringParam: 'path',
      pathNumberParam: 100,
      queryStringParam: 'query',
      queryNumberParam: -100,
    })
    expect(
      routeWithPathAndQueryParameters.href({
        pathStringParam: 'path',
        pathNumberParam: 100,
        queryStringParam: 'query',
        queryNumberParam: -100,
      }),
    ).toBe(
      '/root/path/intermediate/100?queryStringParam=query&queryNumberParam=-100',
    )

    await router.navigateToUrl(rootRoute.href())

    expect(rootRoute.isActive()).toBe(true)
    expect(rootRoute.parameterValues()).toEqual({})

    await routeWithOnNavigateTo.navigateTo()
    expect(routeWithOnNavigateTo.isActive()).toBe(true)
    expect(routeWithOnNavigateTo.parameterValues()).toEqual({})

    await routeWithOnNavigateToAndParameters.navigateTo({
      pathParam: 'pathValue',
      queryParam: 'queryValue',
    })

    expect(routeWithOnNavigateToAndParameters.isActive()).toBe(true)
    expect(routeWithOnNavigateToAndParameters.parameterValues()).toEqual({
      pathParam: 'pathValue',
      queryParam: 'queryValue',
    })

    const navToCancel = routeForCancellation.navigateTo()

    expect(routeForCancellation.isActive()).toBe(false)
    expect(router.navigationIsInProgress()).toBe(true)

    await parentRoute.navigateTo({
      parentParam: 'parent',
      parentQueryParam: 'parent',
    })

    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
    })
    expect(childRoute1.isActive()).toBe(false)
    expect(childRoute2.isActive()).toBe(false)
    expect(nestedChildRoute.isActive()).toBe(false)

    await childRoute1.navigateTo({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
    })

    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
    })
    expect(childRoute1.isActive()).toBe(true)
    expect(childRoute1.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
    })
    expect(childRoute2.isActive()).toBe(false)
    expect(nestedChildRoute.isActive()).toBe(false)

    await childRoute2.navigateTo({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child2Param: 100,
      childQueryParam2: -100,
    })

    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child2Param: 100,
      childQueryParam2: -100,
    })
    expect(childRoute1.isActive()).toBe(false)
    expect(childRoute2.isActive()).toBe(true)
    expect(childRoute2.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child2Param: 100,
      childQueryParam2: -100,
    })
    expect(nestedChildRoute.isActive()).toBe(false)

    await nestedChildRoute.navigateTo({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
      nestedChildParam: 'nested',
      nestedChildQueryParam: 'nested',
    })

    expect(parentRoute.isActive()).toBe(true)
    expect(parentRoute.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
      nestedChildParam: 'nested',
      nestedChildQueryParam: 'nested',
    })
    expect(childRoute1.isActive()).toBe(true)
    expect(childRoute1.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
      nestedChildParam: 'nested',
      nestedChildQueryParam: 'nested',
    })
    expect(childRoute2.isActive()).toBe(false)
    expect(nestedChildRoute.isActive()).toBe(true)
    expect(nestedChildRoute.parameterValues()).toEqual({
      parentParam: 'parent',
      parentQueryParam: 'parent',
      child1Param: 'child1',
      childQueryParam1: 'child1',
      nestedChildParam: 'nested',
      nestedChildQueryParam: 'nested',
    })

    const rootChild = rootRoute.addChildRoute('rootChild')
    expect(rootChild.href()).toBe(`/rootChild`)

    const window: any = {
      location: {
        pathname: routeWithoutParameters.href(),
        search: '',
        href: `https://domain.com/${routeWithoutParameters.href()}`,
      },
      addEventListener: jest.fn(),
    }

    const finishedNav = rootRoute.navigateTo()
    await expect(finishedNav).resolves.toBe(NAVIGATION_FINISHED)

    const cancelledNav = routeThatCancelsNav.navigateTo()
    await expect(cancelledNav).resolves.toBe(NAVIGATION_CANCELLED)

    const syncThrowNav = routeThatThrowsSync.navigateTo()
    await expect(syncThrowNav).rejects.toBeDefined()

    const asyncThrowNav = routeThatThrowsAsync.navigateTo()
    await expect(asyncThrowNav).rejects.toBeDefined()

    const notExistsNav = router.navigateToUrl('/doesNotExist')
    await expect(notExistsNav).rejects.toBeDefined()

    router.activate(window)

    // give the router time to finish the navigation
    await new Promise<void>((r) => setTimeout(r, 0))

    expect(routeWithoutParameters.isActive()).toBe(true)
    expect(routeWithoutParameters.parameterValues()).toEqual({})

    await expect(cancelledNavigation).resolves.toBe(NAVIGATION_CANCELLED)
    await expect(navToCancel).resolves.toBe(NAVIGATION_CANCELLED)
  })
})

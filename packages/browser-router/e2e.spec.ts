// this file contains an end-to-end test for the public API

import { getSimpluxBrowserRouter } from '@simplux/browser-router'
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
  RouteWithPathAndQueryParametersPathPart,
  RouteWithPathAndQueryParametersQueryPart,
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

    const routeWithExplicitParameterInterfaces = router.addRoute<
      RouteWithPathAndQueryParametersPathPart,
      RouteWithPathAndQueryParametersQueryPart
    >(routeTemplateWithPathAndQueryParameters)

    expect(routeWithExplicitParameterInterfaces.name).toBe(
      routeTemplateWithPathAndQueryParameters,
    )

    const namedRoute = router.addRoute(rootRouteTemplate, { name: 'testName' })
    expect(namedRoute.name).toBe('testName')

    const routeWithOnNavigateTo = router.addRoute(
      routeTemplateWithOnNavigateTo,
      {
        onNavigateTo: async () => {
          await Promise.resolve()
        },
      },
    )

    const routeWithOnNavigateToAndParameters = router.addRoute(
      routeTemplateWithOnNavigateToAndParameters,
      {
        onNavigateTo: async ({ parameters }) => {
          expect(parameters.pathParam).toBe('pathValue')
          expect(parameters.queryParam).toBe('queryValue')
          await Promise.resolve()
        },
      },
    )

    expect(router.anyRouteIsActive()).toBe(false)

    await rootRoute.navigateTo()

    expect(rootRoute.isActive()).toBe(true)
    expect(rootRoute.parameterValues()).toEqual({})

    expect(router.anyRouteIsActive()).toBe(true)

    await routeWithoutParameters.navigateTo()

    expect(routeWithoutParameters.isActive()).toBe(true)
    expect(routeWithoutParameters.parameterValues()).toEqual({})

    await routeWithPathParameters.navigateTo({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
    })

    expect(routeWithPathParameters.isActive()).toBe(true)
    expect(routeWithPathParameters.parameterValues()).toEqual({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
    })

    await routeWithQueryParameters.navigateTo({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
    })

    expect(routeWithQueryParameters.isActive()).toBe(true)
    expect(routeWithQueryParameters.parameterValues()).toEqual({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
    })

    await routeWithOptionalQueryParameter.navigateTo({
      requiredParam: 'a',
    })

    expect(routeWithOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOptionalQueryParameter.parameterValues()).toEqual({
      requiredParam: 'a',
    })

    await routeWithOnlyOptionalQueryParameter.navigateTo()

    expect(routeWithOnlyOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOnlyOptionalQueryParameter.parameterValues()).toEqual({})

    await routeWithOnlyOptionalQueryParameter.navigateTo({
      optionalParam: 'opt',
    })

    expect(routeWithOnlyOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOnlyOptionalQueryParameter.parameterValues()).toEqual({
      optionalParam: 'opt',
    })

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

    const window: any = {
      location: { pathname: routeWithoutParameters.href(), search: '' },
      addEventListener: jest.fn(),
    }

    router.activate(window)

    expect(routeWithoutParameters.isActive()).toBe(true)
    expect(routeWithoutParameters.parameterValues()).toEqual({})
  })
})

// this file contains an end-to-end test for the public API

import { getSimpluxBrowserRouter } from '@simplux/browser-router'
import {
  emptyRouterState,
  rootRouteTemplate,
  routeTemplateWithOnlyOptionalQueryParameter,
  routeTemplateWithOptionalQueryParameter,
  routeTemplateWithoutParameters,
  routeTemplateWithPathAndQueryParameters,
  routeTemplateWithPathParameters,
  routeTemplateWithQueryParameters,
} from './src/testdata.js'

describe(`@simplux/browser-router`, () => {
  it('works', () => {
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

    const namedRoute = router.addRoute(rootRouteTemplate, { name: 'testName' })
    expect(namedRoute.name).toBe('testName')

    rootRoute.navigateTo()

    expect(rootRoute.isActive()).toBe(true)
    expect(rootRoute.parameterValues()).toEqual({})

    routeWithoutParameters.navigateTo()

    expect(routeWithoutParameters.isActive()).toBe(true)
    expect(routeWithoutParameters.parameterValues()).toEqual({})

    routeWithPathParameters.navigateTo({
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

    routeWithQueryParameters.navigateTo({
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

    routeWithOptionalQueryParameter.navigateTo({
      requiredParam: 'a',
    })

    expect(routeWithOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOptionalQueryParameter.parameterValues()).toEqual({
      requiredParam: 'a',
    })

    routeWithOnlyOptionalQueryParameter.navigateTo()

    expect(routeWithOnlyOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOnlyOptionalQueryParameter.parameterValues()).toEqual({})

    routeWithOnlyOptionalQueryParameter.navigateTo({
      optionalParam: 'opt',
    })

    expect(routeWithOnlyOptionalQueryParameter.isActive()).toBe(true)
    expect(routeWithOnlyOptionalQueryParameter.parameterValues()).toEqual({
      optionalParam: 'opt',
    })

    routeWithPathAndQueryParameters.navigateTo({
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
  })
})

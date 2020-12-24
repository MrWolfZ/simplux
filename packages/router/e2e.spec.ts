// this file contains an end-to-end test for the public API

import { createSimpluxRouter } from '@simplux/router'
import {
  emptyRouterState,
  routeName1,
  routeName2,
  routerStateWithRoute1,
  routerStateWithTwoRoutes,
} from './src/testdata.js'

describe(`@simplux/router`, () => {
  it('works', () => {
    const router = createSimpluxRouter()

    expect(router.state()).toEqual(emptyRouterState)

    const testRoute1 = router.addRoute(routeName1)

    expect(testRoute1.name).toBe(routeName1)
    expect(router.state()).toEqual(routerStateWithRoute1)

    const testRoute2 = router.addRoute(routeName2, {
      parameterDefaults: {
        stringParam: 'string',
        numberParam: 100,
        booleanParam: true,
      },
    })

    expect(testRoute2.name).toBe(routeName2)
    expect(router.state()).toEqual(routerStateWithTwoRoutes)

    testRoute1.navigateTo({})

    expect(testRoute1.isActive()).toBe(true)
    expect(testRoute1.parameterValues()).toEqual({})

    testRoute2.navigateTo({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
    })

    expect(testRoute2.isActive()).toBe(true)
    expect(testRoute2.parameterValues()).toEqual({
      stringParam: 'a',
      numberParam: 1,
      booleanParam: false,
    })
  })
})

import { getSimpluxRouter, NAVIGATION_CANCELLED } from '@simplux/router'
import {
  clearAllSimpluxMocks,
  mockEffect,
  mockModuleState,
  mockMutation,
  mockSelector,
} from '@simplux/testing'
import { _BrowserRouterLocationState, _locationModule } from './location.js'
import {
  _BrowserRouterState,
  _module,
  _onLocationStateChange,
} from './module.js'
import { emptyRouterState, makeBrowserRouterState } from './testdata.js'

describe(`module`, () => {
  afterEach(clearAllSimpluxMocks)

  it('starts with an empty state', () => {
    expect(_module.state()).toEqual(emptyRouterState)
  })

  describe('mutations', () => {
    describe(_module.addRoute, () => {
      it('parses template without parameters', () => {
        const template = 'root/nested'

        const state = makeBrowserRouterState({
          pathTemplateSegments: template.split('/'),
          queryParameters: [],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('parses template with path parameters', () => {
        const template =
          'root/:stringParam/intermediate/:numberParam:number/trailing'

        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            template.split('/')[0]!,
            {
              parameterName: 'stringParam',
              parameterType: 'string',
            },
            template.split('/')[2]!,
            {
              parameterName: 'numberParam',
              parameterType: 'number',
            },
            template.split('/')[4]!,
          ],
          queryParameters: [],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('parses template with query parameters', () => {
        const template = 'root/nested?stringParam&numberParam:number'

        const state = makeBrowserRouterState({
          pathTemplateSegments: template.split('?')[0]!.split('/'),
          queryParameters: [
            {
              parameterName: 'stringParam',
              parameterType: 'string',
              isOptional: false,
            },
            {
              parameterName: 'numberParam',
              parameterType: 'number',
              isOptional: false,
            },
          ],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('parses template with path and query parameters', () => {
        const template = 'root/:pathParam?queryParam'

        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            {
              parameterName: 'pathParam',
              parameterType: 'string',
            },
          ],
          queryParameters: [
            {
              parameterName: 'queryParam',
              parameterType: 'string',
              isOptional: false,
            },
          ],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('parses template with required and optional missing query parameters', () => {
        const template = 'root/nested?stringParam[&numberParam:number]'

        const state = makeBrowserRouterState({
          pathTemplateSegments: template.split('?')[0]!.split('/'),
          queryParameters: [
            {
              parameterName: 'stringParam',
              parameterType: 'string',
              isOptional: false,
            },
            {
              parameterName: 'numberParam',
              parameterType: 'number',
              isOptional: true,
            },
          ],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('parses template with only optional missing query parameters', () => {
        const template = 'root/nested[?stringParam:string]'

        const state = makeBrowserRouterState({
          pathTemplateSegments: template.split('[')[0]!.split('/'),
          queryParameters: [
            {
              parameterName: 'stringParam',
              parameterType: 'string',
              isOptional: true,
            },
          ],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('strips leading and trailing slashes', () => {
        const template = '/root/nested/'

        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('creates route without segments for empty template', () => {
        const template = ''

        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('creates route without segments for template /', () => {
        const template = '/'

        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('creates route with empty segments', () => {
        const template = 'root//nested'

        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', '', 'nested'],
          queryParameters: [],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('creates route with empty segments with query parameters', () => {
        const template = '?queryParam:string'

        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [
            {
              parameterName: 'queryParam',
              parameterType: 'string',
              isOptional: false,
            },
          ],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })

      it('creates route with empty segments with optional query parameters', () => {
        const template = '[?queryParam:string]'

        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [
            {
              parameterName: 'queryParam',
              parameterType: 'string',
              isOptional: true,
            },
          ],
        })

        const updateState = _module.addRoute.withState(
          emptyRouterState,
          1,
          template,
        )

        expect(updateState).toEqual(state)
      })
    })

    describe(_module.setCurrentNavigationUrl, () => {
      it('sets the url', () => {
        const newUrl = '/root/nested'
        const updatedState = _module.setCurrentNavigationUrl.withState(
          { routes: [], currentNavigationUrl: undefined },
          newUrl,
        )

        expect(updatedState.currentNavigationUrl).toBe(newUrl)
      })
    })
  })

  describe('selectors', () => {
    describe(_module.href, () => {
      it('creates href for route without parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        const href = _module.href.withState(state, 1)

        expect(href).toBe(`/root/nested`)
      })

      it('creates href for route with path parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            {
              parameterName: 'stringParam',
              parameterType: 'string',
            },
            'intermediate',
            {
              parameterName: 'numberParam',
              parameterType: 'number',
            },
            'trailing',
          ],
          queryParameters: [],
        })

        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe(
          `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/trailing`,
        )
      })

      it('creates href for route with query parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [
            {
              parameterName: 'stringParam',
              parameterType: 'string',
              isOptional: false,
            },
            {
              parameterName: 'numberParam',
              parameterType: 'number',
              isOptional: false,
            },
          ],
        })

        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe(
          `/root/nested?stringParam=${parameterValues.stringParam}&numberParam=${parameterValues.numberParam}`,
        )
      })

      it('creates href for route with path and query parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            {
              parameterName: 'pathParam',
              parameterType: 'string',
            },
          ],
          queryParameters: [
            {
              parameterName: 'queryParam',
              parameterType: 'string',
              isOptional: false,
            },
          ],
        })

        const parameterValues = {
          pathParam: 'pathValue',
          queryParam: 'queryValue',
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe(
          `/root/${parameterValues.pathParam}?queryParam=${parameterValues.queryParam}`,
        )
      })

      it('creates href for route with required and optional missing query parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [
            {
              parameterName: 'requiredParam',
              parameterType: 'string',
              isOptional: false,
            },
            {
              parameterName: 'optionalParam',
              parameterType: 'string',
              isOptional: true,
            },
          ],
        })

        const parameterValues = {
          requiredParam: 'parameterValue',
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe(
          `/root/nested?requiredParam=${parameterValues.requiredParam}`,
        )
      })

      it('creates href for route with only optional missing query parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [
            {
              parameterName: 'stringParam',
              parameterType: 'string',
              isOptional: true,
            },
          ],
        })

        const href = _module.href.withState(state, 1)

        expect(href).toBe(`/root/nested`)
      })

      it('encodes parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            {
              parameterName: 'pathParam',
              parameterType: 'string',
            },
          ],
          queryParameters: [
            {
              parameterName: 'queryParam',
              parameterType: 'string',
              isOptional: false,
            },
          ],
        })

        const parameterValues = {
          pathParam: 'should/=?encode',
          queryParam: 'should/=?encode',
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe(
          '/root/should%2F%3D%3Fencode?queryParam=should%2F%3D%3Fencode',
        )
      })

      it('encodes path segments and parameterNames', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'ro=ot',
            {
              parameterName: 'path=Param',
              parameterType: 'string',
            },
          ],
          queryParameters: [
            {
              parameterName: 'query/Param',
              parameterType: 'string',
              isOptional: false,
            },
          ],
        })

        const parameterValues = {
          ['path=Param']: 'value',
          ['query/Param']: 'value',
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe('/ro%3Dot/value?query%2FParam=value')
      })

      it('creates empty href for route without segments', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        const href = _module.href.withState(state, 1)

        expect(href).toBe(``)
      })

      it('creates href for route without segments but with query parameters', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [
            {
              parameterName: 'param',
              parameterType: 'string',
              isOptional: false,
            },
          ],
        })

        const parameterValues = {
          param: 'value',
        }

        const href = _module.href.withState(state, 1, parameterValues)

        expect(href).toBe(`?param=value`)
      })
    })

    // TODO: once array support is added add test for multiple same query parameters
    describe(_module.routeIdAndParametersByUrl, () => {
      it('finds route without parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/nested`,
        )

        expect(result).toEqual([2, {}])
      })

      it('finds route with path parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [
              'root',
              {
                parameterName: 'stringParam',
                parameterType: 'string',
              },
              'intermediate',
              {
                parameterName: 'numberParam',
                parameterType: 'number',
              },
              'trailing',
            ],
            queryParameters: [],
          },
        )

        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/trailing`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('finds route with query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [
              {
                parameterName: 'stringParam',
                parameterType: 'string',
                isOptional: false,
              },
              {
                parameterName: 'numberParam',
                parameterType: 'number',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/nested?stringParam=${parameterValues.stringParam}&numberParam=${parameterValues.numberParam}`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('finds route with path and query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [
              'root',
              {
                parameterName: 'pathParam',
                parameterType: 'string',
              },
            ],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          pathParam: 'pathValue',
          queryParam: 'queryValue',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/${parameterValues.pathParam}?queryParam=${parameterValues.queryParam}`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('finds route with required and optional missing query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [
              {
                parameterName: 'requiredParam',
                parameterType: 'string',
                isOptional: false,
              },
              {
                parameterName: 'optionalParam',
                parameterType: 'string',
                isOptional: true,
              },
            ],
          },
        )

        const parameterValues = {
          requiredParam: 'parameterValue',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/nested?requiredParam=${parameterValues.requiredParam}`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('finds route with only optional missing query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [
              {
                parameterName: 'stringParam',
                parameterType: 'string',
                isOptional: true,
              },
            ],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/nested`,
        )

        expect(result).toEqual([2, {}])
      })

      it('decodes parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [
              'root',
              {
                parameterName: 'pathParam',
                parameterType: 'string',
              },
            ],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          pathParam: 'should/=?encode',
          queryParam: 'should/=?encode',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          '/root/should%2F%3D%3Fencode?queryParam=should%2F%3D%3Fencode',
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('decodes path segments and parameterNames', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [
              'ro=ot',
              {
                parameterName: 'path=Param',
                parameterType: 'string',
              },
            ],
            queryParameters: [
              {
                parameterName: 'query/Param',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          ['path=Param']: 'value',
          ['query/Param']: 'value',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          '/ro%3Dot/value?query%2FParam=value',
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('returns undefined if no matching route path is found', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root'],
            queryParameters: [],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          '/doesNotExist',
        )

        expect(result).toEqual(undefined)
      })

      it('returns undefined if a required query is missing', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root'],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          '/root',
        )

        expect(result).toEqual(undefined)
      })

      it('ignores extraneous query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root'],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          queryParam: 'value',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root?queryParam=${parameterValues.queryParam}&otherParam=otherValue`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('treats string query parameters without value as empty string', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root'],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          queryParam: '',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root?queryParam`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('treats number query parameters without value as zero', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root'],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'number',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          queryParam: 0,
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root?queryParam`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('treats boolean query parameters without value as true', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root'],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'boolean',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          queryParam: true,
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root?queryParam`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('finds empty route', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [],
            queryParameters: [],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(state, ``)

        expect(result).toEqual([2, {}])
      })

      it('finds empty route with leading /', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [],
            queryParameters: [],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(state, `/`)

        expect(result).toEqual([2, {}])
      })

      it('finds empty route with query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: [],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          queryParam: 'value',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `?queryParam=${parameterValues.queryParam}`,
        )

        expect(result).toEqual([2, parameterValues])
      })

      it('finds route with empty segments', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', '', 'nested'],
            queryParameters: [],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root//nested`,
        )

        expect(result).toEqual([2, {}])
      })

      it('ignores trailing and leading slashes', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [],
          },
        )

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/nested/`,
        )

        expect(result).toEqual([2, {}])
      })

      it('ignores trailing slash with query parameters', () => {
        const state = makeBrowserRouterState(
          {
            pathTemplateSegments: ['other'],
            queryParameters: [],
          },
          {
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [
              {
                parameterName: 'queryParam',
                parameterType: 'string',
                isOptional: false,
              },
            ],
          },
        )

        const parameterValues = {
          queryParam: 'value',
        }

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          `/root/nested/?queryParam=${parameterValues.queryParam}`,
        )

        expect(result).toEqual([2, parameterValues])
      })
    })
  })

  describe('effects', () => {
    const routerNavByIdMock = jest.fn().mockResolvedValueOnce(undefined)
    const setCurrentNavigationUrlMock = jest.fn()
    const navAndPushUrlMock = jest.fn().mockResolvedValueOnce(undefined)
    const pushUrlMock = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      mockEffect(getSimpluxRouter().navigateToRouteById, routerNavByIdMock)
      mockMutation(_module.setCurrentNavigationUrl, setCurrentNavigationUrlMock)
      mockEffect(_locationModule.pushNewUrl, pushUrlMock)
      mockSelector(_module.routeIdAndParametersByUrl, () => [1, {}])
    })

    describe(_module.navigateToRouteByUrl, () => {
      beforeEach(() => {
        mockEffect(_module.navigateToRouteByIdAndPushUrl, navAndPushUrlMock)
      })

      it('navigates to the correct route', async () => {
        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
        }

        const [mock] = mockSelector(
          _module.routeIdAndParametersByUrl,
          jest.fn().mockReturnValue([2, parameterValues]),
        )

        const url = `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/trailing`

        await _module.navigateToRouteByUrl(url)
        expect(mock).toHaveBeenCalledWith(url)
      })

      it('delegates navigation to other effect', async () => {
        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
        }

        mockSelector(
          _module.routeIdAndParametersByUrl,
          jest.fn().mockReturnValue([2, parameterValues]),
        )

        const url = `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/trailing`

        await _module.navigateToRouteByUrl(url)
        expect(navAndPushUrlMock).toHaveBeenCalledWith(2, parameterValues, url)
      })

      it('returns the return value of the delegated navigation', async () => {
        const delegatedResult = {}
        navAndPushUrlMock.mockResolvedValueOnce(delegatedResult)
        const result = await _module.navigateToRouteByUrl('/root/nested')
        expect(result).toBe(delegatedResult)
      })

      it('throws if no matching route path is found', async () => {
        mockSelector(_module.routeIdAndParametersByUrl, jest.fn())

        const promise = _module.navigateToRouteByUrl('/doesNotExist')

        await expect(promise).rejects.toBeDefined()
        expect(navAndPushUrlMock).not.toHaveBeenCalled()
      })

      it('prefixes the url with /', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        await _module.navigateToRouteByUrl(`root/nested`)

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, `/root/nested`)
      })

      it('sets the url to empty if empty', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        await _module.navigateToRouteByUrl('')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('sets the url to empty if /', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        await _module.navigateToRouteByUrl('/')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('strips origin from URL', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)
        mockSelector(_locationModule.origin, () => 'https://example.com')

        await _module.navigateToRouteByUrl(`https://example.com/root/nested`)

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, `/root/nested`)
      })

      it('sets the url to empty if url is origin', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        mockModuleState(_module, state)
        mockSelector(_locationModule.origin, () => 'https://example.com')

        await _module.navigateToRouteByUrl('https://example.com')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('sets the url to empty if url is origin with slash', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        mockModuleState(_module, state)
        mockSelector(_locationModule.origin, () => 'https://example.com')

        await _module.navigateToRouteByUrl('https://example.com/')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('throws if url has origin and is different', async () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)
        mockSelector(_locationModule.origin, () => 'https://example.com')

        const result = _module.navigateToRouteByUrl(
          `https://other.org/root/nested`,
        )

        await expect(result).rejects.toBeDefined()
      })

      it('cancels the navigation if the url is equal to the current navigation URL', async () => {
        const currentNavigationUrl = `/root/nested`

        const state: _BrowserRouterState = {
          ...makeBrowserRouterState({
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [],
          }),
          currentNavigationUrl,
        }

        mockModuleState(_module, state)

        const result = await _module.navigateToRouteByUrl(currentNavigationUrl)

        expect(routerNavByIdMock).not.toHaveBeenCalled()
        expect(result).toBe(NAVIGATION_CANCELLED)
      })
    })

    describe(_module.navigateToRouteById, () => {
      beforeEach(() => {
        mockEffect(_module.navigateToRouteByIdAndPushUrl, navAndPushUrlMock)
      })

      it('delegates to other effect', async () => {
        const routeId = 1
        const parameters = { param: 'value' }

        mockSelector(_module.href, () => '/root/nested')

        await _module.navigateToRouteById(routeId, parameters)

        expect(navAndPushUrlMock).toHaveBeenCalledWith(
          routeId,
          parameters,
          '/root/nested',
        )
      })

      it('returns the return value of the delegated navigation', async () => {
        const delegatedResult = {}
        navAndPushUrlMock.mockResolvedValueOnce(delegatedResult)

        const routeId = 1
        const parameters = { param: 'value' }

        mockSelector(_module.href, () => '/root/nested')

        const result = await _module.navigateToRouteById(routeId, parameters)

        expect(result).toBe(delegatedResult)
      })
    })

    describe(_module.navigateToRouteByIdAndPushUrl, () => {
      it('delegates to the base router', async () => {
        const routeId = 1
        const parameters = { param: 'value' }

        await _module.navigateToRouteByIdAndPushUrl(routeId, parameters, '')

        expect(routerNavByIdMock).toHaveBeenCalledWith(routeId, parameters)
      })

      it('returns the result of the delegation', async () => {
        const delegatedResult = {}
        routerNavByIdMock.mockResolvedValueOnce(delegatedResult)

        const routeId = 1
        const parameters = { param: 'value' }

        const result = await _module.navigateToRouteByIdAndPushUrl(
          routeId,
          parameters,
          '',
        )

        expect(result).toBe(delegatedResult)
      })

      it('pushes the new url to the location module after the navigation', async () => {
        let resolve = () => {}
        const routerNavByIdPromise = new Promise<void>((r) => (resolve = r))
        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        expect(pushUrlMock).not.toHaveBeenCalled()

        resolve()
        await promise

        expect(pushUrlMock).toHaveBeenCalledWith(url)
      })

      it('does not push the new url if navigation is cancelled', async () => {
        let cancelNav = () => {}
        const routerNavByIdPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        cancelNav()
        await promise

        expect(pushUrlMock).not.toHaveBeenCalled()
      })

      it('sets the current navigation url at the start of the navigation', async () => {
        let resolve = () => {}
        const routerNavByIdPromise = new Promise<void>((r) => (resolve = r))
        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(url)

        resolve()
        await promise
      })

      it('clears the current navigation url at the end of the navigation', async () => {
        let resolve = () => {}
        const routerNavByIdPromise = new Promise<void>((r) => (resolve = r))
        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        const promise = _module.navigateToRouteByIdAndPushUrl(
          1,
          {},
          `/root/nested`,
        )

        setCurrentNavigationUrlMock.mockClear()

        resolve()
        await promise

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(undefined)
      })

      it('does not clear the current navigation url if navigation is cancelled', async () => {
        let cancelNav = () => {}
        const routerNavByIdPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        setCurrentNavigationUrlMock.mockClear()

        cancelNav()
        await promise

        expect(setCurrentNavigationUrlMock).not.toHaveBeenCalled()
      })
    })
  })

  describe('state change handlers', () => {
    describe('on location changes', () => {
      const emptyLocationState: _BrowserRouterLocationState = {
        url: '',
        origin: '',
        isActive: false,
      }

      it('navigates to the new URL if active', () => {
        const url = '/root/nested'

        const [mock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())
        mock.mockResolvedValueOnce(undefined)

        _onLocationStateChange(
          { ...emptyLocationState, isActive: true, url },
          { ...emptyLocationState, isActive: true },
        )

        expect(mock).toHaveBeenCalledWith(url)
      })

      it('does not navigate to the new URL if inactive', () => {
        const url = '/root/nested'

        const [mock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())
        mock.mockResolvedValueOnce(undefined)

        _onLocationStateChange(
          { ...emptyLocationState, url },
          emptyLocationState,
        )

        expect(mock).not.toHaveBeenCalled()
      })

      it('does not navigate to the URL if it is the same as before', () => {
        const url = '/root/nested'

        const [mock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())
        mock.mockResolvedValueOnce(undefined)

        _onLocationStateChange(
          { ...emptyLocationState, isActive: true, url },
          { ...emptyLocationState, isActive: true, url },
        )

        expect(mock).not.toHaveBeenCalled()
      })

      it('logs errors to the console', async () => {
        const url = '/root/nested'

        const error = new Error()
        const [mock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())
        mock.mockRejectedValueOnce(error)

        const logErrorMock = jest
          .spyOn(global.console, 'error')
          .mockImplementationOnce(() => {})

        _onLocationStateChange(
          { ...emptyLocationState, isActive: true, url },
          { ...emptyLocationState, isActive: true },
        )

        // give the error time to propagate
        await Promise.resolve()

        expect(logErrorMock).toHaveBeenCalledWith(error)

        logErrorMock.mockRestore()
      })
    })
  })
})

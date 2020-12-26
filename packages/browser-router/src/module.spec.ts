import {
  clearAllSimpluxMocks,
  mockEffect,
  mockModuleState,
  mockMutation,
} from '@simplux/testing'
import { getSimpluxRouter } from '../../router/index.js'
import { _locationModule } from './location.js'
import {
  SimpluxBrowserRouterState,
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
    const navByIdMock = jest.fn()
    const setCurrentNavigationUrlMock = jest.fn()
    const pushUrlMock = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      mockEffect(getSimpluxRouter().navigateToRouteById, navByIdMock)
      mockMutation(_module.setCurrentNavigationUrl, setCurrentNavigationUrlMock)
      mockEffect(_locationModule.pushNewUrl, pushUrlMock)
    })

    // TODO: all of these test can be replaced with a single test once selectors can be mocked
    describe(_module.navigateToRouteByUrl, () => {
      it('navigates to route without parameters', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(`/root/nested`)

        expect(navByIdMock).toHaveBeenCalledWith(2, {})
      })

      it('navigates to route with path parameters', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(
          `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/trailing`,
        )

        expect(navByIdMock).toHaveBeenCalledWith(2, parameterValues)
      })

      it('navigates to route with query parameters', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(
          `/root/nested?stringParam=${parameterValues.stringParam}&numberParam=${parameterValues.numberParam}`,
        )

        expect(navByIdMock).toHaveBeenCalledWith(2, parameterValues)
      })

      it('navigates to route with path and query parameters', () => {
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
                parameterName: 'falseParam',
                parameterType: 'boolean',
                isOptional: false,
              },
              {
                parameterName: 'trueParam',
                parameterType: 'boolean',
                isOptional: true,
              },
            ],
          },
        )

        const parameterValues = {
          pathParam: 'pathValue',
          falseParam: false,
          trueParam: true,
        }

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(
          `/root/${parameterValues.pathParam}?falseParam=${parameterValues.falseParam}&trueParam=${parameterValues.trueParam}`,
        )

        expect(navByIdMock).toHaveBeenCalledWith(2, parameterValues)
      })

      it('navigates to route with required and optional missing query parameters', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(
          `/root/nested?requiredParam=${parameterValues.requiredParam}`,
        )

        expect(navByIdMock).toHaveBeenCalledWith(2, parameterValues)
      })

      it('navigates to route with only optional missing query parameters', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(`/root/nested`)

        expect(navByIdMock).toHaveBeenCalledWith(2, {})
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(
          '/root/should%2F%3D%3Fencode?queryParam=should%2F%3D%3Fencode',
        )

        expect(navByIdMock).toHaveBeenCalledWith(2, parameterValues)
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl('/ro%3Dot/value?query%2FParam=value')

        expect(navByIdMock).toHaveBeenCalledWith(2, parameterValues)
      })

      it('ignores the navigation if no matching route path is found', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl('/doesNotExist')

        expect(navByIdMock).not.toHaveBeenCalled()
      })

      it('ignores the navigation if a required query is missing', () => {
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

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl('/root')

        expect(navByIdMock).not.toHaveBeenCalled()
      })

      it('prefixes the url with /', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(`root/nested`)

        expect(pushUrlMock).toHaveBeenCalledWith(`/root/nested`)
      })

      it('sets the url to empty if empty', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl('')

        expect(pushUrlMock).toHaveBeenCalledWith(``)
      })

      it('pushes the new url to the location module', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(`/root/nested`)

        expect(pushUrlMock).toHaveBeenCalledWith(`/root/nested`)
      })

      it('sets the current navigation url at the start of the navigation', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(`/root/nested`)

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(`/root/nested`)
      })

      it('clears the current navigation url at the end of the navigation', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root', 'nested'],
          queryParameters: [],
        })

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(`/root/nested`)

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(undefined)
      })

      it('ignores the navigation if the url is equal to the current navigation URL', () => {
        const currentNavigationUrl = `/root/nested`

        const state: SimpluxBrowserRouterState = {
          ...makeBrowserRouterState({
            pathTemplateSegments: ['root', 'nested'],
            queryParameters: [],
          }),
          currentNavigationUrl,
        }

        mockModuleState(_module, state)

        _module.navigateToRouteByUrl(currentNavigationUrl)

        expect(navByIdMock).not.toHaveBeenCalled()
      })
    })

    describe(_module.navigateToRouteById, () => {
      it('delegates to the base router', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: ['root'],
          queryParameters: [],
        })

        const routeId = 1
        const parameters = { param: 'value' }

        mockModuleState(_module, state)

        _module.navigateToRouteById(routeId, parameters)

        expect(navByIdMock).toHaveBeenCalledWith(routeId, parameters)
      })

      it('pushes the new url to the location module', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            { parameterName: 'param', parameterType: 'string' },
          ],
          queryParameters: [],
        })

        const routeId = 1
        const parameters = { param: 'value' }

        mockModuleState(_module, state)

        _module.navigateToRouteById(routeId, parameters)

        expect(pushUrlMock).toHaveBeenCalledWith(`/root/value`)
      })

      it('sets the current navigation url at the start of the navigation', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            { parameterName: 'param', parameterType: 'string' },
          ],
          queryParameters: [],
        })

        const routeId = 1
        const parameters = { param: 'value' }

        mockModuleState(_module, state)

        _module.navigateToRouteById(routeId, parameters)

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(`/root/value`)
      })

      it('clears the current navigation url at the end of the navigation', () => {
        const state = makeBrowserRouterState({
          pathTemplateSegments: [
            'root',
            { parameterName: 'param', parameterType: 'string' },
          ],
          queryParameters: [],
        })

        const routeId = 1
        const parameters = { param: 'value' }

        mockModuleState(_module, state)

        _module.navigateToRouteById(routeId, parameters)

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(undefined)
      })
    })
  })

  describe('state change handlers', () => {
    describe('on location changes', () => {
      it('navigates to the new URL if active', () => {
        const url = '/root/nested'

        const [mock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())

        _onLocationStateChange({ isActive: true, url })

        expect(mock).toHaveBeenCalledWith(url)
      })

      it('does not navigate to the new URL if inactive', () => {
        const url = '/root/nested'

        const [mock] = mockEffect(_module.navigateToRouteByUrl, jest.fn())

        _onLocationStateChange({ isActive: false, url })

        expect(mock).not.toHaveBeenCalled()
      })
    })
  })
})

import { clearAllSimpluxMocks } from '@simplux/testing'
import { _module } from './module.js'
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
    })
  })

  describe('effects', () => {
    // TODO
  })
})

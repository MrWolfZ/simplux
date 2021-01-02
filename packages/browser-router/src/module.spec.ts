import { getSimpluxRouter, NAVIGATION_CANCELLED } from '@simplux/router'
import {
  clearAllSimpluxMocks,
  mockEffect,
  mockMutation,
  mockSelector,
} from '@simplux/testing'
import { _BrowserRouterLocationState, _locationModule } from './location.js'
import { _module, _onLocationStateChange } from './module.js'
import { emptyRouterState } from './testdata.js'

describe(`module`, () => {
  afterEach(clearAllSimpluxMocks)

  it('starts with an empty state', () => {
    expect(_module.state()).toEqual(emptyRouterState)
  })

  describe('url handling', () => {
    it('works for template without parameters', () => {
      const template = 'root/nested'
      const url = '/root/nested'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('works for template with path string parameter', () => {
      const template = 'root/:param'

      const parameterValues = {
        param: 'parameterValue',
      }

      const url = `/root/${parameterValues.param}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with path number parameter', () => {
      const template = 'root/:param:number'

      const parameterValues = {
        param: 100,
      }

      const url = `/root/${parameterValues.param}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with path boolean parameter', () => {
      const template = 'root/:param:boolean'

      const parameterValues = {
        param: false,
      }

      const url = `/root/${parameterValues.param}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with path array parameter', () => {
      const template = 'root/:param:string[]/child'

      const parameterValues = {
        param: ['a', 'b', 'charlie'],
      }

      const url = `/root/${parameterValues.param.join(',')}/child`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with empty path array parameter', () => {
      const template = 'root/:param:string[]/child'

      const parameterValues = {
        param: [],
      }

      const url = `/root//child`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with multiple path parameters', () => {
      const template =
        'root/:stringParam/intermediate/:numberParam:number/trailing'

      const parameterValues = {
        stringParam: 'parameterValue',
        numberParam: 100,
      }

      const url = `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/trailing`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with query string parameter', () => {
      const template = 'root?param'

      const parameterValues = {
        param: 'parameterValue',
      }

      const url = `/root?param=${parameterValues.param}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with query number parameter', () => {
      const template = 'root?param:number'

      const parameterValues = {
        param: 100,
      }

      const url = `/root?param=${parameterValues.param}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with query boolean parameter', () => {
      const template = 'root?param:boolean'

      const parameterValues = {
        param: false,
      }

      const url = `/root?param=${parameterValues.param}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with query array parameter', () => {
      const template = 'root?param:string[]'

      const parameterValues = {
        param: ['a', 'b', 'charlie'],
      }

      const url = `/root?param=${parameterValues.param.join(',')}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with optional query array parameter', () => {
      const template = 'root[?param:string[]]'

      const parameterValues = {
        param: ['a', 'b', 'charlie'],
      }

      const url = `/root?param=${parameterValues.param.join(',')}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with empty query array parameter', () => {
      const template = 'root?param:string[]'

      const parameterValues = {
        param: [],
      }

      const url = `/root?param=`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!

      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with multiple query parameters', () => {
      const template = 'root/nested?stringParam:string&numberParam:number'

      const parameterValues = {
        stringParam: 'parameterValue',
        numberParam: 100,
      }

      const url = `/root/nested?stringParam=${parameterValues.stringParam}&numberParam=${parameterValues.numberParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with path and query parameters', () => {
      const template = 'root/:pathParam:string?queryParam:string'

      const parameterValues = {
        pathParam: 'pathValue',
        queryParam: 'queryValue',
      }

      const url = `/root/${parameterValues.pathParam}?queryParam=${parameterValues.queryParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with required and optional query parameters', () => {
      const template = 'root/nested?requiredParam:string[&optionalParam:string]'

      const parameterValues = {
        requiredParam: 'parameterValue',
        optionalParam: 'optionalValue',
      }

      const url = `/root/nested?requiredParam=${parameterValues.requiredParam}&optionalParam=${parameterValues.optionalParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with required and optional missing query parameters', () => {
      const template = 'root/nested?requiredParam:string[&optionalParam:string]'

      const parameterValues = {
        requiredParam: 'parameterValue',
      }

      const url = `/root/nested?requiredParam=${parameterValues.requiredParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with required and optional missing array query parameters', () => {
      const template =
        'root/nested?requiredParam:string[&optionalParam:string[]]'

      const parameterValues = {
        requiredParam: 'parameterValue',
      }

      const url = `/root/nested?requiredParam=${parameterValues.requiredParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with only optional query parameters', () => {
      const template = 'root/nested[?optionalParam:string]'

      const parameterValues = {
        optionalParam: 'optionalValue',
      }

      const url = `/root/nested?optionalParam=${parameterValues.optionalParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with only optional missing query parameters', () => {
      const template = 'root/nested[?optionalParam:string]'

      const url = `/root/nested`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('strips leading and trailing slashes from template', () => {
      const template = '/root/nested/'

      const url = '/root/nested'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('strips trailing slash from template with query parameters', () => {
      const template = 'root/nested/?queryParam'

      const parameterValues = {
        queryParam: 'value',
      }

      const url = `/root/nested?queryParam=${parameterValues.queryParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works empty middle path parameter', () => {
      const template = 'root/:stringParam/nested'

      const parameterValues = {
        stringParam: '',
      }

      const url = `/root/${parameterValues.stringParam}/nested`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works empty trailing path parameter', () => {
      const template = 'root/:stringParam'

      const parameterValues = {
        stringParam: '',
      }

      const url = `/root/${parameterValues.stringParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for for empty template', () => {
      const template = ''

      const url = ''

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('works for for template /', () => {
      const template = '/'

      const url = ''

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('works for for empty template and url /', () => {
      const template = ''

      const url = '/'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe('')
    })

    it('works for template with empty segments', () => {
      const template = 'root//nested'

      const url = '/root//nested'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('works for template with empty segments with query parameters', () => {
      const template = '?queryParam:string'

      const parameterValues = {
        queryParam: 'value',
      }

      const url = `?queryParam=${parameterValues.queryParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with empty segments with optional query parameters', () => {
      const template = '[?queryParam:string]'

      const parameterValues = {
        queryParam: 'value',
      }

      const url = `?queryParam=${parameterValues.queryParam}`

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for template with empty segments with optional missing query parameters', () => {
      const template = '[?queryParam:string]'

      const url = ''

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, {})

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual({})
      expect(href).toBe(url)
    })

    it('works for parameter names that need to be encoded', () => {
      const template = '/ro=ot/:path=Param?query/Param'

      const parameterValues = {
        ['path=Param']: 'pathValue',
        ['query/Param']: 'queryValue',
      }

      const url = '/ro%3Dot/pathValue?query%2FParam=queryValue'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for parameter values that need to be encoded', () => {
      const template = '/root/:pathParam?queryParam'

      const parameterValues = {
        pathParam: 'should/=?encode',
        queryParam: 'should/=?encode',
      }

      const url = '/root/should%2F%3D%3Fencode?queryParam=should%2F%3D%3Fencode'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for array parameter values that need to be encoded', () => {
      const template = '/root/:pathParam:string[]/child?queryParam:string[]'

      const parameterValues = {
        pathParam: ['should/=?encode', 'other,comma'],
        queryParam: ['should/=?encode', 'other,comma'],
      }

      const url =
        '/root/should%2F%3D%3Fencode,other%2Ccomma/child?queryParam=should%2F%3D%3Fencode,other%2Ccomma'

      const state = _module.addRoute.withState(emptyRouterState, 2, template)
      const [
        foundId,
        foundParameterValues,
      ] = _module.routeIdAndParametersByUrl.withState(state, url)!
      const href = _module.href.withState(state, 2, parameterValues)

      expect(foundId).toBe(2)
      expect(foundParameterValues).toEqual(parameterValues)
      expect(href).toBe(url)
    })

    it('works for multiple templates with different constant first path segment', () => {
      const template1 = 'root/nested'
      const template2 = 'other/child'

      const url1 = '/root/nested'
      const url2 = '/other/child'

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, {})
      const href2 = _module.href.withState(state, 2, {})

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual({})
      expect(foundParameterValues2).toEqual({})
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with same first constant path segment', () => {
      const template1 = 'root/nested'
      const template2 = 'root/other'

      const url1 = '/root/nested'
      const url2 = '/root/other'

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, {})
      const href2 = _module.href.withState(state, 2, {})

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual({})
      expect(foundParameterValues2).toEqual({})
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with same first parameter path segment', () => {
      const template1 = ':root/nested'
      const template2 = ':root/other'

      const parameterValues1 = {
        root: 'value1',
      }

      const parameterValues2 = {
        root: 'value2',
      }

      const url1 = `/${parameterValues1.root}/nested`
      const url2 = `/${parameterValues2.root}/other`

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, parameterValues1)
      const href2 = _module.href.withState(state, 2, parameterValues2)

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual(parameterValues1)
      expect(foundParameterValues2).toEqual(parameterValues2)
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with same second constant path segment', () => {
      const template1 = 'root/nested/first'
      const template2 = 'root/nested/second'

      const url1 = '/root/nested/first'
      const url2 = '/root/nested/second'

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, {})
      const href2 = _module.href.withState(state, 2, {})

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual({})
      expect(foundParameterValues2).toEqual({})
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with same second parameter path segment', () => {
      const template1 = 'root/:nested:string/first'
      const template2 = 'root/:nested/second'

      const parameterValues1 = {
        nested: 'value1',
      }

      const parameterValues2 = {
        nested: 'value2',
      }

      const url1 = `/root/${parameterValues1.nested}/first`
      const url2 = `/root/${parameterValues2.nested}/second`

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, parameterValues1)
      const href2 = _module.href.withState(state, 2, parameterValues2)

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual(parameterValues1)
      expect(foundParameterValues2).toEqual(parameterValues2)
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with first being constant prefix of second', () => {
      const template1 = 'root'
      const template2 = 'root/nested'

      const url1 = '/root'
      const url2 = '/root/nested'

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, {})
      const href2 = _module.href.withState(state, 2, {})

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual({})
      expect(foundParameterValues2).toEqual({})
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with same second parameter path segment', () => {
      const template1 = ':root'
      const template2 = ':root/nested'

      const parameterValues1 = {
        root: 'value1',
      }

      const parameterValues2 = {
        root: 'value2',
      }

      const url1 = `/${parameterValues1.root}`
      const url2 = `/${parameterValues2.root}/nested`

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, parameterValues1)
      const href2 = _module.href.withState(state, 2, parameterValues2)

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual(parameterValues1)
      expect(foundParameterValues2).toEqual(parameterValues2)
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with different required query parameters', () => {
      const template1 = 'root/:nested/child?stringParam'
      const template2 = 'root/:nested/child?numberParam:number'

      const parameterValues1 = {
        nested: 'value1',
        stringParam: 'query1',
      }

      const parameterValues2 = {
        nested: 'value2',
        numberParam: 100,
      }

      const url1 = `/root/${parameterValues1.nested}/child?stringParam=${parameterValues1.stringParam}`
      const url2 = `/root/${parameterValues2.nested}/child?numberParam=${parameterValues2.numberParam}`

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, parameterValues1)
      const href2 = _module.href.withState(state, 2, parameterValues2)

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual(parameterValues1)
      expect(foundParameterValues2).toEqual(parameterValues2)
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('works for multiple templates with different required subset query parameters', () => {
      const template1 = 'root/:nested/child?stringParam'
      const template2 = 'root/:nested/child?stringParam&numberParam:number'

      const parameterValues1 = {
        nested: 'value1',
        stringParam: 'query1',
      }

      const parameterValues2 = {
        nested: 'value2',
        stringParam: 'query2',
        numberParam: 100,
      }

      const url1 = `/root/${parameterValues1.nested}/child?stringParam=${parameterValues1.stringParam}`
      const url2 = `/root/${parameterValues2.nested}/child?stringParam=${parameterValues2.stringParam}&numberParam=${parameterValues2.numberParam}`

      let state = _module.addRoute.withState(emptyRouterState, 1, template1)
      state = _module.addRoute.withState(state, 2, template2)

      const [
        foundId1,
        foundParameterValues1,
      ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

      const [
        foundId2,
        foundParameterValues2,
      ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

      const href1 = _module.href.withState(state, 1, parameterValues1)
      const href2 = _module.href.withState(state, 2, parameterValues2)

      expect(foundId1).toBe(1)
      expect(foundId2).toBe(2)
      expect(foundParameterValues1).toEqual(parameterValues1)
      expect(foundParameterValues2).toEqual(parameterValues2)
      expect(href1).toBe(url1)
      expect(href2).toBe(url2)
    })

    it('ignores identical id and template', () => {
      const template = 'root/nested'

      const state1 = _module.addRoute.withState(emptyRouterState, 1, template)
      const state2 = _module.addRoute.withState(state1, 1, template)

      expect(state2).toBe(state1)
    })

    it('ignores identical id and template for path with parameters', () => {
      const template = 'root/:nested/child'

      const state1 = _module.addRoute.withState(emptyRouterState, 1, template)
      const state2 = _module.addRoute.withState(state1, 1, template)

      expect(state2).toBe(state1)
    })

    it('finds conflict for same template but different id', () => {
      const template = 'root/nested'

      const state = _module.addRoute.withState(emptyRouterState, 1, template)

      expect(() => _module.addRoute.withState(state, 2, template)).toThrow()
    })

    it('finds conflict for same template with parameters but different id', () => {
      const template1 = 'root/:nested/child'
      const template2 = 'root/:nested/child'

      const state1 = _module.addRoute.withState(emptyRouterState, 1, template1)
      const state2 = _module.addRoute.withState(emptyRouterState, 1, template2)

      expect(() => _module.addRoute.withState(state1, 2, template2)).toThrow()
      expect(() => _module.addRoute.withState(state2, 2, template1)).toThrow()
    })

    it('finds conflict for parameter path segments of different name', () => {
      const template1 = 'root/:nested/child'
      const template2 = 'root/:other:number/child'

      const state1 = _module.addRoute.withState(emptyRouterState, 1, template1)
      const state2 = _module.addRoute.withState(emptyRouterState, 1, template2)

      expect(() => _module.addRoute.withState(state1, 2, template2)).toThrow()
      expect(() => _module.addRoute.withState(state2, 2, template1)).toThrow()
    })

    it('finds conflict for equal path but different optional query parameters', () => {
      const template1 = 'root/:nested/child?stringParam'
      const template2 = 'root/:nested/child?stringParam[&numberParam:number]'

      const state1 = _module.addRoute.withState(emptyRouterState, 1, template1)
      const state2 = _module.addRoute.withState(emptyRouterState, 1, template2)

      expect(() => _module.addRoute.withState(state1, 2, template2)).toThrow()
      expect(() => _module.addRoute.withState(state2, 2, template1)).toThrow()
    })

    describe('for child routes', () => {
      it('works for template without parameters', () => {
        const parentTemplate = 'root/nested'
        const childTemplate = 'child/childNested'
        const url = '/root/nested/child/childNested'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, {})

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual({})
        expect(href).toBe(url)
      })

      it('works for template with path string parameter', () => {
        const parentTemplate = 'root/:param'
        const childTemplate = 'child/:childParam'

        const parameterValues = {
          param: 'parameterValue',
          childParam: 'childParameterValue',
        }

        const url = `/root/${parameterValues.param}/child/${parameterValues.childParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with path number parameter', () => {
        const parentTemplate = 'root/:param:number'
        const childTemplate = 'child/:childParam:number'

        const parameterValues = {
          param: 100,
          childParam: -999,
        }

        const url = `/root/${parameterValues.param}/child/${parameterValues.childParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with path boolean parameter', () => {
        const parentTemplate = 'root/:param:boolean'
        const childTemplate = 'child/:childParam:boolean'

        const parameterValues = {
          param: false,
          childParam: true,
        }

        const url = `/root/${parameterValues.param}/child/${parameterValues.childParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with path array parameter', () => {
        const parentTemplate = 'root/:param:string[]'
        const childTemplate = 'child/:childParam:string[]'

        const parameterValues = {
          param: ['a', 'b', 'charlie'],
          childParam: ['d', 'e', 'f'],
        }

        const url = `/root/${parameterValues.param.join(',')}/child/${
          parameterValues.childParam
        }`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with empty path array parameter', () => {
        const parentTemplate = 'root/:param:string[]'
        const childTemplate = 'child/:childParam:string[]/nested'

        const parameterValues = {
          param: [],
          childParam: [],
        }

        const url = `/root//child//nested`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with multiple path parameters', () => {
        const parentTemplate =
          'root/:stringParam/intermediate/:numberParam:number'
        const childTemplate =
          'child/:childStringParam/nested/:childNumberParam:number'

        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
          childStringParam: 'childParameterValue',
          childNumberParam: -999,
        }

        const url = `/root/${parameterValues.stringParam}/intermediate/${parameterValues.numberParam}/child/${parameterValues.childStringParam}/nested/${parameterValues.childNumberParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with query string parameter', () => {
        const parentTemplate = 'root?param'
        const childTemplate = 'child?childParam'

        const parameterValues = {
          param: 'parameterValue',
          childParam: 'childParameterValue',
        }

        const url = `/root/child?param=${parameterValues.param}&childParam=${parameterValues.childParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with query number parameter', () => {
        const parentTemplate = 'root?param:number'
        const childTemplate = 'child?childParam:number'

        const parameterValues = {
          param: 100,
          childParam: -999,
        }

        const url = `/root/child?param=${parameterValues.param}&childParam=${parameterValues.childParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with query boolean parameter', () => {
        const parentTemplate = 'root?param:boolean'
        const childTemplate = 'child?childParam:boolean'

        const parameterValues = {
          param: false,
          childParam: true,
        }

        const url = `/root/child?param=${parameterValues.param}&childParam=${parameterValues.childParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with query array parameter', () => {
        const parentTemplate = 'root?param:string[]'
        const childTemplate = 'child?childParam:string[]'

        const parameterValues = {
          param: ['a', 'b', 'charlie'],
          childParam: ['d', 'e', 'f'],
        }

        const url = `/root/child?param=${parameterValues.param.join(
          ',',
        )}&childParam=${parameterValues.childParam.join(',')}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with optional query array parameter', () => {
        const parentTemplate = 'root[?param:string[]]'
        const childTemplate = 'child[?childParam:string[]]'

        const parameterValues = {
          param: ['a', 'b', 'charlie'],
          childParam: ['d', 'e', 'f'],
        }

        const url = `/root/child?param=${parameterValues.param.join(
          ',',
        )}&childParam=${parameterValues.childParam.join(',')}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with empty query array parameter', () => {
        const parentTemplate = 'root?param:string[]'
        const childTemplate = 'child?childParam:string[]'

        const parameterValues = {
          param: [],
          childParam: [],
        }

        const url = `/root/child?param=&childParam=`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with multiple query parameters', () => {
        const parentTemplate =
          'root/nested?stringParam:string&numberParam:number'
        const childTemplate =
          'child/nested?childStringParam&childNumberParam:number'

        const parameterValues = {
          stringParam: 'parameterValue',
          numberParam: 100,
          childStringParam: 'childParameterValue',
          childNumberParam: -999,
        }

        const url = `/root/nested/child/nested?stringParam=${parameterValues.stringParam}&numberParam=${parameterValues.numberParam}&childStringParam=${parameterValues.childStringParam}&childNumberParam=${parameterValues.childNumberParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with path and query parameters', () => {
        const parentTemplate = 'root/:pathParam:string?queryParam:string'
        const childTemplate = 'child/:childPathParam?childQueryParam'

        const parameterValues = {
          pathParam: 'pathValue',
          queryParam: 'queryValue',
          childPathParam: 'childPathValue',
          childQueryParam: 'childQueryValue',
        }

        const url = `/root/${parameterValues.pathParam}/child/${parameterValues.childPathParam}?queryParam=${parameterValues.queryParam}&childQueryParam=${parameterValues.childQueryParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with required and optional query parameters', () => {
        const parentTemplate =
          'root/nested?requiredParam:string[&optionalParam:string]'
        const childTemplate =
          'child/nested?childRequiredParam[&childOptionalParam:string]'

        const parameterValues = {
          requiredParam: 'parameterValue',
          optionalParam: 'optionalValue',
          childRequiredParam: 'childParameterValue',
          childOptionalParam: 'childOptionalValue',
        }

        const url = `/root/nested/child/nested?requiredParam=${parameterValues.requiredParam}&optionalParam=${parameterValues.optionalParam}&childRequiredParam=${parameterValues.childRequiredParam}&childOptionalParam=${parameterValues.childOptionalParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with required and optional missing query parameters', () => {
        const parentTemplate =
          'root/nested?requiredParam:string[&optionalParam:string]'
        const childTemplate =
          'child/nested?childRequiredParam:string[&childOptionalParam:string]'

        const parameterValues = {
          requiredParam: 'parameterValue',
          childRequiredParam: 'childParameterValue',
        }

        const url = `/root/nested/child/nested?requiredParam=${parameterValues.requiredParam}&childRequiredParam=${parameterValues.childRequiredParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with required and optional missing array query parameters', () => {
        const parentTemplate =
          'root/nested?requiredParam:string[&optionalParam:string[]]'
        const childTemplate =
          'child/nested?childRequiredParam:string[&childOptionalParam:string[]]'

        const parameterValues = {
          requiredParam: 'parameterValue',
          childRequiredParam: 'childParameterValue',
        }

        const url = `/root/nested/child/nested?requiredParam=${parameterValues.requiredParam}&childRequiredParam=${parameterValues.childRequiredParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with only optional query parameters', () => {
        const parentTemplate = 'root/nested[?optionalParam:string]'
        const childTemplate = 'child/nested[?childOptionalParam:string]'

        const parameterValues = {
          optionalParam: 'optionalValue',
          childOptionalParam: 'childOptionalValue',
        }

        const url = `/root/nested/child/nested?optionalParam=${parameterValues.optionalParam}&childOptionalParam=${parameterValues.childOptionalParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with only optional missing query parameters', () => {
        const parentTemplate = 'root/nested[?optionalParam:string]'
        const childTemplate = 'child/nested[?childOptionalParam:string]'

        const url = `/root/nested/child/nested`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, {})

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual({})
        expect(href).toBe(url)
      })

      it('strips leading and trailing slashes from template', () => {
        const parentTemplate = '/root/nested/'
        const childTemplate = '/child/nested/'

        const url = '/root/nested/child/nested'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, {})

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual({})
        expect(href).toBe(url)
      })

      it('strips trailing slash from template with query parameters', () => {
        const parentTemplate = 'root/nested/?queryParam'
        const childTemplate = 'child/nested/?childQueryParam'

        const parameterValues = {
          queryParam: 'value',
          childQueryParam: 'childValue',
        }

        const url = `/root/nested/child/nested?queryParam=${parameterValues.queryParam}&childQueryParam=${parameterValues.childQueryParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works empty middle path parameter', () => {
        const parentTemplate = 'root/:stringParam/nested'
        const childTemplate = 'child/:childStringParam/nested'

        const parameterValues = {
          stringParam: '',
          childStringParam: '',
        }

        const url = `/root/${parameterValues.stringParam}/nested/child/${parameterValues.childStringParam}/nested`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works empty trailing path parameter', () => {
        const parentTemplate = 'root/:stringParam'
        const childTemplate = 'child/:childStringParam'

        const parameterValues = {
          stringParam: '',
          childStringParam: '',
        }

        const url = `/root/${parameterValues.stringParam}/child/${parameterValues.childStringParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for template with empty segments', () => {
        const parentTemplate = 'root'
        const childTemplate = 'child//nested'

        const url = '/root/child//nested'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, {})

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual({})
        expect(href).toBe(url)
      })

      it('works for for empty parent template', () => {
        const parentTemplate = ''
        const childTemplate = 'child'

        const url = '/child'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, {})

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual({})
        expect(href).toBe(url)
      })

      it('works for for parent template /', () => {
        const parentTemplate = '/'
        const childTemplate = 'child'

        const url = '/child'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!

        const href = _module.href.withState(state, 2, {})

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual({})
        expect(href).toBe(url)
      })

      it('works for parent template with empty segments with query parameters', () => {
        const parentTemplate = '?queryParam:string'
        const childTemplate = 'child?childQueryParam'

        const parameterValues = {
          queryParam: 'value',
          childQueryParam: 'childValue',
        }

        const url = `/child?queryParam=${parameterValues.queryParam}&childQueryParam=${parameterValues.childQueryParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for parent template with empty segments with optional query parameters', () => {
        const parentTemplate = '[?queryParam:string]'
        const childTemplate = 'child[?childQueryParam]'

        const parameterValues = {
          queryParam: 'value',
          childQueryParam: 'childValue',
        }

        const url = `/child?queryParam=${parameterValues.queryParam}&childQueryParam=${parameterValues.childQueryParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      // tslint:disable-next-line: max-line-length
      it('works for parent template with empty segments with optional missing query parameters', () => {
        const parentTemplate = '[?queryParam:string]'
        const childTemplate = 'child?childQueryParam'

        const parameterValues = {
          childQueryParam: 'childValue',
        }

        const url = `/child?childQueryParam=${parameterValues.childQueryParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for parameter names that need to be encoded', () => {
        const parentTemplate = '/ro=ot/:path=Param?query/Param'
        const childTemplate = '/child=Path/:childPath=Param?childQuery/Param'

        const parameterValues = {
          ['path=Param']: 'pathValue',
          ['query/Param']: 'queryValue',
          ['childPath=Param']: 'childPathValue',
          ['childQuery/Param']: 'childQueryValue',
        }

        const url =
          '/ro%3Dot/pathValue/child%3DPath/childPathValue?query%2FParam=queryValue&childQuery%2FParam=childQueryValue'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for parameter values that need to be encoded', () => {
        const parentTemplate = '/root/:pathParam?queryParam'
        const childTemplate = '/child/:childParam?childQueryParam'

        const parameterValues = {
          pathParam: 'should/=?encode',
          queryParam: 'should/=?encode',
          childParam: 'child/=?encode',
          childQueryParam: 'child/=?encode',
        }

        const url =
          '/root/should%2F%3D%3Fencode/child/child%2F%3D%3Fencode?queryParam=should%2F%3D%3Fencode&childQueryParam=child%2F%3D%3Fencode'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for array parameter values that need to be encoded', () => {
        const parentTemplate = '/root/:pathParam:string[]?queryParam:string[]'
        const childTemplate =
          '/child/:childParam:string[]?childQueryParam:string[]'

        const parameterValues = {
          pathParam: ['should/=?encode', 'other,comma'],
          queryParam: ['should/=?encode', 'other,comma'],
          childParam: ['child/=?encode', 'child,comma'],
          childQueryParam: ['child/=?encode', 'child,comma'],
        }

        const url =
          '/root/should%2F%3D%3Fencode,other%2Ccomma/child/child%2F%3D%3Fencode,child%2Ccomma?queryParam=should%2F%3D%3Fencode,other%2Ccomma&childQueryParam=child%2F%3D%3Fencode,child%2Ccomma'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate)

        const [
          foundId,
          foundParameterValues,
        ] = _module.routeIdAndParametersByUrl.withState(state, url)!
        const href = _module.href.withState(state, 2, parameterValues)

        expect(foundId).toBe(2)
        expect(foundParameterValues).toEqual(parameterValues)
        expect(href).toBe(url)
      })

      it('works for multiple templates with different constant first path segment', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child1/nested'
        const childTemplate2 = 'child2/nested'

        const url1 = '/root/child1/nested'
        const url2 = '/root/child2/nested'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, {})
        const href2 = _module.href.withState(state, 3, {})

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual({})
        expect(foundParameterValues2).toEqual({})
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with same first constant path segment', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'nested/child1'
        const childTemplate2 = 'nested/child2'

        const url1 = '/root/nested/child1'
        const url2 = '/root/nested/child2'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, {})
        const href2 = _module.href.withState(state, 3, {})

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual({})
        expect(foundParameterValues2).toEqual({})
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with same first parameter path segment', () => {
        const parentTemplate = 'root'
        const childTemplate1 = ':child/child1'
        const childTemplate2 = ':child/child2'

        const parameterValues1 = {
          child: 'value1',
        }

        const parameterValues2 = {
          child: 'value2',
        }

        const url1 = `/root/${parameterValues1.child}/child1`
        const url2 = `/root/${parameterValues2.child}/child2`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, parameterValues1)
        const href2 = _module.href.withState(state, 3, parameterValues2)

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual(parameterValues1)
        expect(foundParameterValues2).toEqual(parameterValues2)
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with same second constant path segment', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/nested/first'
        const childTemplate2 = 'child/nested/second'

        const url1 = '/root/child/nested/first'
        const url2 = '/root/child/nested/second'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, {})
        const href2 = _module.href.withState(state, 3, {})

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual({})
        expect(foundParameterValues2).toEqual({})
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with same second parameter path segment', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/:nested/first'
        const childTemplate2 = 'child/:nested/second'

        const parameterValues1 = {
          nested: 'value1',
        }

        const parameterValues2 = {
          nested: 'value2',
        }

        const url1 = `/root/child/${parameterValues1.nested}/first`
        const url2 = `/root/child/${parameterValues2.nested}/second`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, parameterValues1)
        const href2 = _module.href.withState(state, 3, parameterValues2)

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual(parameterValues1)
        expect(foundParameterValues2).toEqual(parameterValues2)
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with first being constant prefix of second', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child'
        const childTemplate2 = 'child/nested'

        const url1 = '/root/child'
        const url2 = '/root/child/nested'

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, {})
        const href2 = _module.href.withState(state, 3, {})

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual({})
        expect(foundParameterValues2).toEqual({})
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with same second parameter path segment', () => {
        const parentTemplate = 'root'
        const childTemplate1 = ':child'
        const childTemplate2 = ':child/nested'

        const parameterValues1 = {
          child: 'value1',
        }

        const parameterValues2 = {
          child: 'value2',
        }

        const url1 = `/root/${parameterValues1.child}`
        const url2 = `/root/${parameterValues2.child}/nested`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, parameterValues1)
        const href2 = _module.href.withState(state, 3, parameterValues2)

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual(parameterValues1)
        expect(foundParameterValues2).toEqual(parameterValues2)
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with different required query parameters', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/:nested/child?stringParam'
        const childTemplate2 = 'child/:nested/child?numberParam:number'

        const parameterValues1 = {
          nested: 'value1',
          stringParam: 'query1',
        }

        const parameterValues2 = {
          nested: 'value2',
          numberParam: 100,
        }

        const url1 = `/root/child/${parameterValues1.nested}/child?stringParam=${parameterValues1.stringParam}`
        const url2 = `/root/child/${parameterValues2.nested}/child?numberParam=${parameterValues2.numberParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, parameterValues1)
        const href2 = _module.href.withState(state, 3, parameterValues2)

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual(parameterValues1)
        expect(foundParameterValues2).toEqual(parameterValues2)
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('works for multiple templates with different required subset query parameters', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/:nested?stringParam'
        const childTemplate2 = 'child/:nested?stringParam&numberParam:number'

        const parameterValues1 = {
          nested: 'value1',
          stringParam: 'query1',
        }

        const parameterValues2 = {
          nested: 'value2',
          stringParam: 'query2',
          numberParam: 100,
        }

        const url1 = `/root/child/${parameterValues1.nested}?stringParam=${parameterValues1.stringParam}`
        const url2 = `/root/child/${parameterValues2.nested}?stringParam=${parameterValues2.stringParam}&numberParam=${parameterValues2.numberParam}`

        let state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        state = _module.addChildRoute.withState(state, 1, 2, childTemplate1)
        state = _module.addChildRoute.withState(state, 1, 3, childTemplate2)

        const [
          foundId1,
          foundParameterValues1,
        ] = _module.routeIdAndParametersByUrl.withState(state, url1)!

        const [
          foundId2,
          foundParameterValues2,
        ] = _module.routeIdAndParametersByUrl.withState(state, url2)!

        const href1 = _module.href.withState(state, 2, parameterValues1)
        const href2 = _module.href.withState(state, 3, parameterValues2)

        expect(foundId1).toBe(2)
        expect(foundId2).toBe(3)
        expect(foundParameterValues1).toEqual(parameterValues1)
        expect(foundParameterValues2).toEqual(parameterValues2)
        expect(href1).toBe(url1)
        expect(href2).toBe(url2)
      })

      it('ignores identical id and template', () => {
        const parentTemplate = 'root'
        const childTemplate = 'child'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const state1 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate,
        )

        const state2 = _module.addChildRoute.withState(
          state1,
          1,
          2,
          childTemplate,
        )

        expect(state2).toBe(state1)
      })

      it('ignores identical id and template for path with parameters', () => {
        const parentTemplate = 'root'
        const childTemplate = 'child/:param'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const state1 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate,
        )

        const state2 = _module.addChildRoute.withState(
          state1,
          1,
          2,
          childTemplate,
        )

        expect(state2).toBe(state1)
      })

      it('finds conflict for same template but different id', () => {
        const parentTemplate = 'root'
        const childTemplate = 'child'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const state1 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate,
        )

        expect(() =>
          _module.addChildRoute.withState(state1, 1, 3, childTemplate),
        ).toThrow()
      })

      it('finds conflict for same template with parameters but different id', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/:nested/other'
        const childTemplate2 = 'child/:nested/other'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const state1 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate1,
        )

        const state2 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate2,
        )

        expect(() =>
          _module.addChildRoute.withState(state1, 1, 3, childTemplate2),
        ).toThrow()
        expect(() =>
          _module.addChildRoute.withState(state2, 1, 3, childTemplate1),
        ).toThrow()
      })

      it('finds conflict for parameter path segments of different name', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/:nested/other'
        const childTemplate2 = 'child/:other:number/other'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const state1 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate1,
        )

        const state2 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate2,
        )

        expect(() =>
          _module.addChildRoute.withState(state1, 1, 3, childTemplate2),
        ).toThrow()
        expect(() =>
          _module.addChildRoute.withState(state2, 1, 3, childTemplate1),
        ).toThrow()
      })

      it('finds conflict for equal path but different optional query parameters', () => {
        const parentTemplate = 'root'
        const childTemplate1 = 'child/:nested/other?stringParam'
        const childTemplate2 =
          'child/:nested/other?stringParam[&numberParam:number]'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const state1 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate1,
        )

        const state2 = _module.addChildRoute.withState(
          state,
          1,
          2,
          childTemplate2,
        )

        expect(() =>
          _module.addChildRoute.withState(state1, 1, 3, childTemplate2),
        ).toThrow()
        expect(() =>
          _module.addChildRoute.withState(state2, 1, 3, childTemplate1),
        ).toThrow()
      })

      it('finds conflict for empty child template', () => {
        const parentTemplate = 'root'
        const childTemplate = ''

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        expect(() =>
          _module.addChildRoute.withState(state, 1, 2, childTemplate),
        ).toThrow()
      })

      it('finds conflict for child template /', () => {
        const parentTemplate = 'root'
        const childTemplate = '/'

        const state = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        expect(() =>
          _module.addChildRoute.withState(state, 1, 2, childTemplate),
        ).toThrow()
      })
    })
  })

  describe('mutations', () => {
    describe(_module.setCurrentNavigationUrl, () => {
      it('sets the url', () => {
        const newUrl = '/root/nested'
        const updatedState = _module.setCurrentNavigationUrl.withState(
          emptyRouterState,
          newUrl,
        )

        expect(updatedState.currentNavigationUrl).toBe(newUrl)
      })
    })
  })

  describe('selectors', () => {
    describe(_module.routeIdAndParametersByUrl, () => {
      it('returns undefined if no matching route path is found', () => {
        const state = _module.addRoute.withState(emptyRouterState, 2, 'root')

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          '/doesNotExist',
        )

        expect(result).toEqual(undefined)
      })

      it('returns undefined if a required query is missing', () => {
        const template = 'root?queryParam'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

        const result = _module.routeIdAndParametersByUrl.withState(
          state,
          '/root',
        )

        expect(result).toEqual(undefined)
      })

      it('ignores extraneous query parameters', () => {
        const template = 'root?queryParam'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

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
        const template = 'root?queryParam'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

        const parameterValues = {
          queryParam: '',
        }

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam`,
          ),
        ).toEqual([2, parameterValues])

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam=`,
          ),
        ).toEqual([2, parameterValues])
      })

      it('treats number query parameters without value as zero', () => {
        const template = 'root?queryParam:number'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

        const parameterValues = {
          queryParam: 0,
        }

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam`,
          ),
        ).toEqual([2, parameterValues])

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam=`,
          ),
        ).toEqual([2, parameterValues])
      })

      it('treats boolean query parameters without value as true', () => {
        const template = 'root?queryParam:boolean'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

        const parameterValues = {
          queryParam: true,
        }

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam`,
          ),
        ).toEqual([2, parameterValues])

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam=`,
          ),
        ).toEqual([2, parameterValues])
      })

      it('treats array query parameters without value as ampty array', () => {
        const template = 'root?queryParam:string[]'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

        const parameterValues = {
          queryParam: [],
        }

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam`,
          ),
        ).toEqual([2, parameterValues])

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam=`,
          ),
        ).toEqual([2, parameterValues])
      })

      it('treats multiple query parameters for array param as one array', () => {
        const template = 'root?queryParam:string[]'
        const state = _module.addRoute.withState(emptyRouterState, 2, template)

        const parameterValues = {
          queryParam: ['first', 'second'],
        }

        expect(
          _module.routeIdAndParametersByUrl.withState(
            state,
            `/root?queryParam=first&queryParam=second`,
          ),
        ).toEqual([2, parameterValues])
      })
    })

    describe(_module.parameterNamesForTemplate, () => {
      it('gets parameter names for template', () => {
        const parentTemplate =
          'root/:parentParam?requiredParam:string[&optionalParam:string]'
        const childTemplate =
          'child/:childParam?childRequiredParam[&childOptionalParam:string]'

        const stateWithParent = _module.addRoute.withState(
          emptyRouterState,
          1,
          parentTemplate,
        )

        const parentNames = _module.parameterNamesForTemplate.withState(
          emptyRouterState,
          undefined,
          parentTemplate,
        )

        const childNames = _module.parameterNamesForTemplate.withState(
          stateWithParent,
          1,
          childTemplate,
        )

        expect(parentNames).toEqual([
          'parentParam',
          'requiredParam',
          'optionalParam',
        ])

        expect(childNames).toEqual([
          'parentParam',
          'childParam',
          'requiredParam',
          'optionalParam',
          'childRequiredParam',
          'childOptionalParam',
        ])
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
      mockSelector(_module.currentNavigationUrl, () => undefined)
      mockSelector(_module.routeIdAndParametersByUrl, () => [1, {}])
      mockSelector(getSimpluxRouter().navigationIsInProgress, () => false)
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
        await _module.navigateToRouteByUrl(`root/nested`)

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, `/root/nested`)
      })

      it('sets the url to empty if empty', async () => {
        await _module.navigateToRouteByUrl('')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('sets the url to empty if /', async () => {
        await _module.navigateToRouteByUrl('/')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('strips origin from URL', async () => {
        mockSelector(_locationModule.origin, () => 'https://example.com')

        await _module.navigateToRouteByUrl(`https://example.com/root/nested`)

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, `/root/nested`)
      })

      it('sets the url to empty if url is origin', async () => {
        mockSelector(_locationModule.origin, () => 'https://example.com')

        await _module.navigateToRouteByUrl('https://example.com')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('sets the url to empty if url is origin with slash', async () => {
        mockSelector(_locationModule.origin, () => 'https://example.com')

        await _module.navigateToRouteByUrl('https://example.com/')

        expect(navAndPushUrlMock).toHaveBeenCalledWith(1, {}, ``)
      })

      it('throws if url has origin and is different', async () => {
        mockSelector(_locationModule.origin, () => 'https://example.com')

        const result = _module.navigateToRouteByUrl(
          `https://other.org/root/nested`,
        )

        await expect(result).rejects.toBeDefined()
      })

      it('cancels the navigation if the url is equal to the current navigation URL', async () => {
        const currentNavigationUrl = `/root/nested`
        mockSelector(_module.currentNavigationUrl, () => currentNavigationUrl)

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

      it('clears the current navigation url if navigation is cancelled and no navigation is in progress', async () => {
        let cancelNav = () => {}
        const routerNavByIdPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        mockSelector(getSimpluxRouter().navigationIsInProgress, () => false)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        setCurrentNavigationUrlMock.mockClear()

        cancelNav()
        await promise

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(undefined)
      })

      it('does not clear the current navigation url if navigation is cancelled and navigation is in progress', async () => {
        let cancelNav = () => {}
        const routerNavByIdPromise = new Promise<typeof NAVIGATION_CANCELLED>(
          (r) => (cancelNav = () => r(NAVIGATION_CANCELLED)),
        )

        routerNavByIdMock.mockReturnValueOnce(routerNavByIdPromise)

        mockSelector(getSimpluxRouter().navigationIsInProgress, () => true)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        setCurrentNavigationUrlMock.mockClear()

        cancelNav()
        await promise

        expect(setCurrentNavigationUrlMock).not.toHaveBeenCalled()
      })

      // tslint:disable-next-line: max-line-length
      it('clears the current navigation url if navigation throws and no navigation is in progress', async () => {
        routerNavByIdMock.mockImplementationOnce(async () => {
          await Promise.resolve()
          throw new Error()
        })

        mockSelector(getSimpluxRouter().navigationIsInProgress, () => false)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        setCurrentNavigationUrlMock.mockClear()

        await expect(promise).rejects.toBeDefined()

        expect(setCurrentNavigationUrlMock).toHaveBeenCalledWith(undefined)
      })

      it('does not clear the current navigation url if navigation throws and navigation is in progress', async () => {
        routerNavByIdMock.mockImplementationOnce(async () => {
          await Promise.resolve()
          throw new Error()
        })

        mockSelector(getSimpluxRouter().navigationIsInProgress, () => true)

        const url = `/root/nested`
        const promise = _module.navigateToRouteByIdAndPushUrl(1, {}, url)

        setCurrentNavigationUrlMock.mockClear()

        await expect(promise).rejects.toBeDefined()

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

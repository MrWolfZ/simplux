import {
  clearAllSimpluxMocks,
  mockEffect,
  mockModuleState,
  mockMutation,
} from '@simplux/testing'
import { _BrowserRouterLocationState, _locationModule } from './location.js'

describe(`location module`, () => {
  afterEach(clearAllSimpluxMocks)

  const {
    state,
    setIsActive,
    setUrl,
    setOriginFromHref,
    activate,
    setHistoryInstance,
    getHistoryInstance,
    pushNewUrl,
  } = _locationModule

  const emptyState: _BrowserRouterLocationState = {
    url: '',
    origin: '',
    isActive: false,
  }

  it('starts with an empty state', () => {
    expect(state()).toEqual(emptyState)
  })

  describe('mutations', () => {
    describe(setIsActive, () => {
      it('marks the router as active', () => {
        const { isActive } = setIsActive.withState(emptyState, true)

        expect(isActive).toBe(true)
      })

      it('marks the router as inactive', () => {
        const { isActive } = setIsActive.withState(
          { ...emptyState, isActive: true },
          false,
        )

        expect(isActive).toBe(false)
      })
    })

    describe(setUrl, () => {
      it('sets the url', () => {
        const newUrl = '/root/nested'
        const { url } = setUrl.withState(emptyState, newUrl)

        expect(url).toBe(newUrl)
      })

      it('ensures url is prefixed with /', () => {
        const newUrl = 'root/nested'
        const { url } = setUrl.withState(emptyState, newUrl)

        expect(url).toBe(`/${newUrl}`)
      })

      it('sets url to / if new url is empty', () => {
        const newUrl = ''
        const { url } = setUrl.withState(emptyState, newUrl)

        expect(url).toBe('/')
      })
    })

    describe(setOriginFromHref, () => {
      it('extracts origin from an http URL with path', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com/path',
        )

        expect(origin).toBe('http://domain.com')
      })

      it('extracts origin from an https URL with path', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'https://domain.com/path',
        )

        expect(origin).toBe('https://domain.com')
      })

      it('extracts origin from a URL with port and no slash', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com:1234',
        )

        expect(origin).toBe('http://domain.com:1234')
      })

      it('extracts origin from a URL with port and slash', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com:1234/',
        )

        expect(origin).toBe('http://domain.com:1234')
      })

      it('extracts origin from a URL with port and path', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com:1234/path',
        )

        expect(origin).toBe('http://domain.com:1234')
      })

      it('extracts origin from a URL without path or query and no slash', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com',
        )

        expect(origin).toBe('http://domain.com')
      })

      it('extracts origin from a URL without path or query and slash', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com/',
        )

        expect(origin).toBe('http://domain.com')
      })

      it('extracts origin from a URL with query and no slash', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com?query',
        )

        expect(origin).toBe('http://domain.com')
      })

      it('extracts origin from a URL with query and slash', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain.com/?query',
        )

        expect(origin).toBe('http://domain.com')
      })

      it('extracts origin from a URL without TLD', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://domain/path',
        )

        expect(origin).toBe('http://domain')
      })

      it('extracts origin from a URL with IP', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://10.0.0.0/path',
        )

        expect(origin).toBe('http://10.0.0.0')
      })

      it('extracts origin from a URL with IP and port', () => {
        const { origin } = setOriginFromHref.withState(
          emptyState,
          'http://10.0.0.0:1234/path',
        )

        expect(origin).toBe('http://10.0.0.0:1234')
      })

      it('sets the origin to empty if URL is invalid', () => {
        const { origin } = setOriginFromHref.withState(emptyState, 'invalid')
        expect(origin).toBe('')
      })

      it('sets the origin to empty if URL is undefined', () => {
        const { origin } = setOriginFromHref.withState(emptyState, undefined)
        expect(origin).toBe('')
      })
    })
  })

  describe('effects', () => {
    const hrefMock = jest.fn()
    const pathnameMock = jest.fn()
    const searchMock = jest.fn()
    const pushMock = jest.fn()
    const replaceMock = jest.fn()
    const stateMock = jest.fn()
    const addEventListenerMock = jest.fn()
    const removeEventListenerMock = jest.fn()

    const location: Location = {
      ancestorOrigins: undefined!,
      assign: undefined!,
      hash: undefined!,
      host: undefined!,
      hostname: undefined!,
      get href() {
        return hrefMock()
      },
      origin: undefined!,
      get pathname() {
        return pathnameMock()
      },
      port: undefined!,
      protocol: undefined!,
      reload: undefined!,
      replace: undefined!,
      get search() {
        return searchMock()
      },
    }

    const history: History = {
      back: undefined!,
      forward: undefined!,
      go: undefined!,
      length: undefined!,
      pushState: pushMock,
      replaceState: replaceMock,
      scrollRestoration: undefined!,
      get state() {
        return stateMock()
      },
    }

    const window = ({
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      location,
      history,
    } as unknown) as Window

    beforeEach(() => {
      jest.resetAllMocks()
      mockMutation(setIsActive, jest.fn())
      mockMutation(setUrl, jest.fn())
    })

    describe(activate, () => {
      beforeEach(() => {
        mockEffect(setHistoryInstance, jest.fn())
        mockMutation(setOriginFromHref, jest.fn())
      })

      it('marks the router as active', () => {
        pathnameMock.mockReturnValueOnce('/root/nested')
        searchMock.mockReturnValueOnce('?queryParam=test')
        const [setIsActiveMock] = mockMutation(setIsActive, jest.fn())

        activate(window)

        expect(setIsActiveMock).toHaveBeenCalledWith(true)
      })

      it('sets the origin', () => {
        pathnameMock.mockReturnValueOnce('/root')
        searchMock.mockReturnValueOnce('')
        hrefMock.mockReturnValueOnce('https://domain.com/root')
        const [setOriginMock] = mockMutation(setOriginFromHref, jest.fn())

        activate(window)

        expect(setOriginMock).toHaveBeenCalledWith('https://domain.com/root')
      })

      it('throws if the router is already active', () => {
        pathnameMock.mockReturnValueOnce('/root/nested')
        searchMock.mockReturnValueOnce('?queryParam=test')

        mockModuleState(_locationModule, {
          ...emptyState,
          url: '/root',
          isActive: true,
        })

        expect(() => activate(window)).toThrowError()
      })

      it('sets the url in the module', () => {
        pathnameMock.mockReturnValueOnce('/root/nested')
        searchMock.mockReturnValueOnce('?queryParam=test')
        const [setUrlMock] = mockMutation(setUrl, jest.fn())

        activate(window)

        expect(setUrlMock).toHaveBeenCalledWith('/root/nested?queryParam=test')
      })

      it('sets the url in the module without search', () => {
        pathnameMock.mockReturnValueOnce('/root/nested')
        searchMock.mockReturnValueOnce('')
        const [setUrlMock] = mockMutation(setUrl, jest.fn())

        activate(window)

        expect(setUrlMock).toHaveBeenCalledWith('/root/nested')
      })

      it('starts listening to popstate events', () => {
        activate(window)

        expect(addEventListenerMock).toHaveBeenCalledWith(
          'popstate',
          expect.any(Function),
        )
      })

      it('stops listening to popstate events when deactivated', () => {
        let eventHandler: Function = () => void 0

        addEventListenerMock.mockImplementationOnce(
          (_, handler) => (eventHandler = handler),
        )

        const deactivate = activate(window)

        deactivate()

        expect(removeEventListenerMock).toHaveBeenCalledWith(
          'popstate',
          eventHandler,
        )
      })

      it('marks the router as inactive when deactivated', () => {
        const deactivate = activate(window)

        const [setIsActiveMock] = mockMutation(setIsActive, jest.fn())

        deactivate()

        expect(setIsActiveMock).toHaveBeenCalledWith(false)
      })

      it('sets the history instance', () => {
        pathnameMock.mockReturnValueOnce('/root/nested')
        searchMock.mockReturnValueOnce('?queryParam=test')
        const [mock] = mockEffect(setHistoryInstance, jest.fn())

        activate(window)

        expect(mock).toHaveBeenCalledWith(window.history)
      })

      describe('on popstate event', () => {
        it('updates the url in the module', () => {
          let eventHandler: Function = () => void 0

          addEventListenerMock.mockImplementationOnce(
            (_, handler) => (eventHandler = handler),
          )

          activate(window)

          const [setUrlMock] = mockMutation(setUrl, jest.fn())

          eventHandler({ state: { url: '/newUrl' } })

          expect(setUrlMock).toHaveBeenCalledWith('/newUrl')
        })

        it('ignores falsy URLs', () => {
          let eventHandler: Function = () => void 0

          addEventListenerMock.mockImplementationOnce(
            (_, handler) => (eventHandler = handler),
          )

          activate(window)

          const [setUrlMock] = mockMutation(setUrl, jest.fn())

          eventHandler({ state: null })
          eventHandler({ state: {} })
          eventHandler({ state: { url: '' } })

          expect(setUrlMock).not.toHaveBeenCalled()
        })
      })
    })

    describe(setHistoryInstance, () => {
      afterEach(() => setHistoryInstance(undefined))

      it('sets the history instance', () => {
        setHistoryInstance(window.history)
        const ret = getHistoryInstance()
        expect(ret).toBe(window.history)
      })
    })

    describe(pushNewUrl, () => {
      it('sets the url in the module', () => {
        const newUrl = '/root/nested?queryParam=value'
        mockModuleState(_locationModule, {
          ...emptyState,
          url: '/root',
          isActive: true,
        })

        mockEffect(getHistoryInstance, () => window.history)
        const [setUrlMock] = mockMutation(setUrl, jest.fn())

        pushNewUrl(newUrl)

        expect(setUrlMock).toHaveBeenCalledWith(newUrl)
      })

      it('pushes a new state entry', () => {
        const newUrl = '/root/nested?queryParam=value'
        mockModuleState(_locationModule, {
          ...emptyState,
          url: '/root',
          isActive: true,
        })

        mockEffect(getHistoryInstance, () => window.history)

        pushNewUrl(newUrl)

        expect(pushMock).toHaveBeenCalledWith({ url: newUrl }, '', newUrl)
      })

      it('does nothing if router is not active', () => {
        const newUrl = '/root/nested?queryParam=value'
        mockModuleState(_locationModule, {
          ...emptyState,
          url: '/root',
          isActive: false,
        })

        const [setUrlMock] = mockMutation(setUrl, jest.fn())

        pushNewUrl(newUrl)

        expect(setUrlMock).not.toHaveBeenCalled()
        expect(pushMock).not.toHaveBeenCalled()
      })

      it('does nothing if the url is the same as current URL', () => {
        const url = '/root/nested?queryParam=value'
        mockModuleState(_locationModule, { ...emptyState, url, isActive: true })
        const [setUrlMock] = mockMutation(setUrl, jest.fn())

        pushNewUrl(url)

        expect(setUrlMock).not.toHaveBeenCalled()
        expect(pushMock).not.toHaveBeenCalled()
      })
    })
  })
})

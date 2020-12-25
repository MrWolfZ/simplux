import {
  createEffects,
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'

// to prevent accidentally accessing built-in objects
declare const window: undefined
declare const location: undefined
declare const history: undefined

/**
 * Helper type to distinguish url values.
 *
 * @public
 */
export type _Url = string

/**
 * The state of the simplux browser router.
 *
 * @public
 */
export interface SimpluxBrowserRouterLocationState {
  /**
   * The current URL.
   */
  url: _Url

  /**
   * Whether the router is active, i.e. whether it interacts with the
   * browser location.
   */
  isActive: boolean
}

const initialState: SimpluxBrowserRouterLocationState = {
  url: '',
  isActive: false,
}

const locationModule = createSimpluxModule(
  'browserRouterLocation',
  initialState,
)

const mutations = createMutations(locationModule, {
  setUrl: (state, url: _Url) => {
    state.url = !url ? '/' : url.startsWith('/') ? url : `/${url}`
  },

  setIsActive: (state, isActive: boolean) => {
    state.isActive = isActive
  },
})

const selectors = createSelectors(locationModule, {
  state: (s) => s,
})

// it's a bit ugly that we have to store this here in the module scope
// but unfortunately there's no better way
let historyInstance: History | undefined

const effects = createEffects({
  activate: (window: Window) => {
    if (selectors.state().isActive) {
      throw new Error('the router is already active')
    }

    effects.setHistoryInstance(window.history)
    mutations.setIsActive(true)

    const url = `${window.location.pathname}${window.location.search}`
    mutations.setUrl(url)

    window.addEventListener('popstate', onPopstateEvent)

    return () => {
      window.removeEventListener('popstate', onPopstateEvent)
      mutations.setIsActive(false)
    }

    function onPopstateEvent({ state }: PopStateEvent) {
      if (state?.url) {
        mutations.setUrl(state.url)
      }
    }
  },

  setHistoryInstance: (history: History | undefined) => {
    historyInstance = history
  },

  getHistoryInstance: () => historyInstance!,

  pushNewUrl: (url: _Url) => {
    if (!selectors.state().isActive) {
      return
    }

    effects.getHistoryInstance().pushState({ url }, '', url)
  },
})

// tslint:disable-next-line:variable-name (internal export)
export const _locationModule = {
  ...locationModule,
  ...mutations,
  ...selectors,
  ...effects,
}

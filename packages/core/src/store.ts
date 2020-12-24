import { combineReducers, Reducer, Store as ReduxStore } from 'redux'

/**
 * @internal
 */
export interface _InternalReduxStoreProxy {
  id: number
  getState: () => any
  dispatch: ReduxStore['dispatch']
  subscribe: ReduxStore['subscribe']
  subscribers: { handler: () => void; unsubscribe: () => void }[]
}

let latestReduxStoreId = 0
let reduxStoreProxy: _InternalReduxStoreProxy | undefined

/**
 * @internal
 */
export const simpluxStore = _createSimpluxStore(_getInternalReduxStoreProxy)

/**
 * This function is part of the internal simplux API that should only ever
 * be used by its extension packages.
 *
 * @internal
 */
export function _getInternalReduxStoreProxy() {
  if (process.env.NODE_ENV !== 'production') {
    if (!reduxStoreProxy) {
      throw new Error(
        'simplux must be initialized with a redux store before it can be used!',
      )
    }
  }

  return reduxStoreProxy!
}

/**
 * @internal
 */
export function _setReduxStore<TState>(
  storeToUse: ReduxStore<TState>,
  simpluxStateGetter: (rootState: TState) => any,
) {
  const previousStoreProxy = reduxStoreProxy

  if (!storeToUse) {
    reduxStoreProxy = undefined
    return () => {
      reduxStoreProxy = previousStoreProxy
    }
  }

  const id = latestReduxStoreId
  latestReduxStoreId += 1

  const subscribers: _InternalReduxStoreProxy['subscribers'] = []

  reduxStoreProxy = _createReduxStoreProxy(
    storeToUse,
    simpluxStateGetter,
    id,
    subscribers,
  )

  if (previousStoreProxy) {
    _transferConfigurationToNewStore(previousStoreProxy, reduxStoreProxy)
  }

  return () => {
    if (process.env.NODE_ENV !== 'production') {
      if (!reduxStoreProxy) {
        return
      }

      if (reduxStoreProxy.id !== id) {
        throw new Error('cannot cleanup store since another store has been set')
      }
    }

    reduxStoreProxy = previousStoreProxy
  }
}

/**
 * @internal
 */
export function _transferConfigurationToNewStore(
  previousStoreProxy: _InternalReduxStoreProxy,
  newReduxStoreProxy: _InternalReduxStoreProxy,
) {
  for (const subscriber of previousStoreProxy.subscribers) {
    subscriber.unsubscribe()
    newReduxStoreProxy.subscribe(subscriber.handler)
  }
}

/**
 * @internal
 */
export function _createReduxStoreProxy<TState>(
  storeToUse: ReduxStore<TState>,
  simpluxStateGetter: (rootState: TState) => any,
  id: number,
  subscribers: _InternalReduxStoreProxy['subscribers'],
): _InternalReduxStoreProxy {
  return {
    id,
    subscribers,
    ...storeToUse,
    getState: () => simpluxStateGetter(storeToUse.getState()),
    subscribe: (handler) => {
      const unsubscribe = storeToUse.subscribe(handler)
      const subscriber = { handler, unsubscribe }
      subscribers.push(subscriber)

      return () => {
        unsubscribe()

        const idx = subscribers.indexOf(subscriber)
        if (idx >= 0) {
          subscribers.splice(idx, 1)
        }
      }
    },
  }
}

/**
 * @internal
 */
export interface _SimpluxStore {
  rootReducer: Reducer
  getState: () => any
  dispatch: ReduxStore['dispatch']
  subscribe: ReduxStore['subscribe']
  setReducer: <T = any>(name: string, reducer: Reducer<T>) => void
  getReducer: <T = any>(name: string) => Reducer<T>
}

/**
 * @internal
 */
export function _createSimpluxStore(
  getReduxStoreProxy: () => _InternalReduxStoreProxy,
): _SimpluxStore {
  const reducers: { [name: string]: Reducer } = {}
  let reducer: Reducer | undefined

  const rootReducer: Reducer = (state = {}, action) =>
    reducer ? reducer(state, action) : state

  return {
    rootReducer,
    getState: () => getReduxStoreProxy().getState(),
    dispatch: (action) => getReduxStoreProxy().dispatch(action),
    subscribe: (listener) => getReduxStoreProxy().subscribe(listener),

    setReducer: (name, reducerToAdd) => {
      reducers[name] = reducerToAdd
      reducer = combineReducers(reducers)

      getReduxStoreProxy().dispatch({ type: `@simplux/setReducer/${name}` })
    },

    getReducer: (name) => reducers[name]!,
  }
}

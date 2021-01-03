import {
  Action,
  combineReducers,
  Dispatch,
  Reducer,
  Store as ReduxStore,
} from 'redux'

/**
 * @internal
 */
export interface _InternalReduxStoreProxy {
  id: number
  getState: () => any
  dispatch: ReduxStore['dispatch']
  subscribe: ReduxStore['subscribe']
  subscribers: { handler: () => void; unsubscribe: () => void }[]
  actionsToDispatchOnStoreChange: Action[]
}

let lastStoreId = 0
let proxy: _InternalReduxStoreProxy | undefined

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
    if (!proxy) {
      throw new Error(
        'simplux must be initialized with a redux store before it can be used!',
      )
    }
  }

  return proxy!
}

/**
 * @internal
 */
export function _setReduxStore<TState>(
  storeToUse: ReduxStore<TState>,
  simpluxStateGetter: (rootState: TState) => any,
) {
  const previousStoreProxy = proxy

  if (!storeToUse) {
    proxy = undefined
    return () => {
      proxy = previousStoreProxy
    }
  }

  const id = lastStoreId++

  const subscribers: _InternalReduxStoreProxy['subscribers'] = []

  proxy = _createReduxStoreProxy(
    storeToUse,
    simpluxStateGetter,
    id,
    subscribers,
  )

  if (previousStoreProxy) {
    _transferSubscribersToNewStore(previousStoreProxy, proxy)
    _dispatchActionsFromPreviousStore(previousStoreProxy, proxy)
  }

  return () => {
    if (process.env.NODE_ENV !== 'production') {
      if (!proxy) {
        return
      }

      if (proxy.id !== id) {
        throw new Error('cannot cleanup store since another store has been set')
      }
    }

    proxy = previousStoreProxy
  }

  function _transferSubscribersToNewStore(
    previousStoreProxy: _InternalReduxStoreProxy,
    newReduxStoreProxy: _InternalReduxStoreProxy,
  ) {
    for (const subscriber of previousStoreProxy.subscribers) {
      subscriber.unsubscribe()
      newReduxStoreProxy.subscribe(subscriber.handler)
    }
  }

  function _dispatchActionsFromPreviousStore(
    { actionsToDispatchOnStoreChange }: _InternalReduxStoreProxy,
    newReduxStoreProxy: _InternalReduxStoreProxy,
  ) {
    for (const action of actionsToDispatchOnStoreChange) {
      newReduxStoreProxy.dispatch(action)
    }
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
  // this is a workaround for a race condition that can happen when loading an
  // application: if an imported module dispatches actions on the store (e.g. by
  // calling mutations in the module scope), these actions can get lost if a
  // new store gets set; this is not what users would expect, so we capture all
  // actions dispatched before the end of the first microtask queue, which basically
  // means capturing all actions dispatched during module evaluation; these actions
  // are then dispatched again on the new store, which restores the expected
  // behavior of seeing those actions in the new store
  let shouldCaptureActions = true
  const actionsToDispatchOnStoreChange: Action[] = []

  function stopCapture() {
    return Promise.resolve().then(() => {
      shouldCaptureActions = false
      const actions = actionsToDispatchOnStoreChange
      actions.splice(0, actions.length)
    })
  }

  stopCapture().catch(() => void 0)

  const dispatch: Dispatch = (action) => {
    if (shouldCaptureActions) {
      actionsToDispatchOnStoreChange.push(action)
    }

    return storeToUse.dispatch(action)
  }

  return {
    id,
    subscribers,
    actionsToDispatchOnStoreChange,
    ...storeToUse,
    dispatch,
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

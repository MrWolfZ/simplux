import { combineReducers, Reducer, Store as ReduxStore } from 'redux'

interface ReduxStoreProxy {
  id: number
  getState: () => any
  dispatch: ReduxStore['dispatch']
  subscribe: ReduxStore['subscribe']
  subscribers: { handler: () => void; unsubscribe: () => void }[]
}

let latestReduxStoreId = 0
let reduxStoreProxy: ReduxStoreProxy | undefined

export const simpluxStore = createSimpluxStore(() => {
  if (!reduxStoreProxy) {
    throw new Error(
      'simplux must be initialized with a redux store before it can be used!',
    )
  }

  return reduxStoreProxy
}, getDefaultFeatureFlags())

export function setReduxStore<TState>(
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

  const subscribers: ReduxStoreProxy['subscribers'] = []

  reduxStoreProxy = createReduxStoreProxy(
    storeToUse,
    simpluxStateGetter,
    id,
    subscribers,
  )

  if (previousStoreProxy) {
    transferConfigurationToNewStore(previousStoreProxy, reduxStoreProxy)
  }

  return () => {
    if (!reduxStoreProxy) {
      return
    }

    if (reduxStoreProxy.id !== id) {
      throw new Error('cannot cleanup store since another store has been set')
    }

    reduxStoreProxy = previousStoreProxy
  }
}

export function transferConfigurationToNewStore(
  previousStoreProxy: ReduxStoreProxy,
  newReduxStoreProxy: ReduxStoreProxy,
) {
  for (const subscriber of previousStoreProxy.subscribers) {
    subscriber.unsubscribe()
    newReduxStoreProxy.subscribe(subscriber.handler)
  }
}

export function createReduxStoreProxy<TState>(
  storeToUse: ReduxStore<TState>,
  simpluxStateGetter: (rootState: TState) => any,
  id: number,
  subscribers: ReduxStoreProxy['subscribers'],
): ReduxStoreProxy {
  return {
    id,
    subscribers,
    ...storeToUse,
    getState: () => simpluxStateGetter(storeToUse.getState()),
    subscribe: handler => {
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

export interface FeatureFlags {
  freezeStateDuringMutations: () => boolean
}

export interface SimpluxStore {
  rootReducer: Reducer
  getState: () => any
  dispatch: ReduxStore['dispatch']
  subscribe: ReduxStore['subscribe']
  setReducer: <T = any>(name: string, reducer: Reducer<T>) => void
  getReducer: <T = any>(name: string) => Reducer<T>
  featureFlags: FeatureFlags
}

export function createSimpluxStore(
  getReduxStoreProxy: () => ReduxStoreProxy,
  featureFlags: FeatureFlags,
): SimpluxStore {
  const reducers: { [name: string]: Reducer } = {}
  let reducer: Reducer | undefined

  const rootReducer: Reducer = (state = {}, action) =>
    reducer ? reducer(state, action) : state

  return {
    rootReducer,
    getState: () => getReduxStoreProxy().getState(),
    dispatch: action => getReduxStoreProxy().dispatch(action),
    subscribe: listener => getReduxStoreProxy().subscribe(listener),

    setReducer: (name, reducerToAdd) => {
      reducers[name] = reducerToAdd
      reducer = combineReducers(reducers)

      getReduxStoreProxy().dispatch({ type: `@simplux/setReducer/${name}` })
    },

    getReducer: name => reducers[name],

    featureFlags,
  }
}

export function getDefaultFeatureFlags(): FeatureFlags {
  return {
    freezeStateDuringMutations: () =>
      process.env && process.env.NODE_ENV === 'development',
  }
}

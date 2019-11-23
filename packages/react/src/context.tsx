import {
  getInternalReduxStoreProxy,
  InternalReduxStoreProxy,
  SimpluxModule,
} from '@simplux/core'
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { unstable_batchedUpdates } from 'react-dom'

export interface SimpluxContextValue {
  subscribeToModuleStateChanges: <TState>(
    simpluxModule: SimpluxModule<TState>,
    handler: (state: TState, previousState: TState) => void,
  ) => () => void

  getModuleState: <TState>(simpluxModule: SimpluxModule<TState>) => TState
}

interface ModuleStates {
  [moduleName: string]: any
}

interface ModuleSubscribers {
  [moduleName: string]: Set<(state: any, previousState: any) => void>
}

// this default context value just passes calls through to the module; this
// is mainly useful for testing since you do not have to wrap your component
// in a provider
const defaultContextValue: SimpluxContextValue = {
  subscribeToModuleStateChanges(simpluxModule, handler) {
    return simpluxModule.subscribeToStateChanges(handler).unsubscribe
  },
  getModuleState: simpluxModule => simpluxModule.getState(),
}

// by always returning 0 for `calculateChangedBits` we prevent components
// from re-rendering just because they access the context value; instead
// it is up to each component to decide when to render, the context is just
// responsible for providing a consistent state value during each render
// pass
const SimpluxContext = createContext(defaultContextValue, () => 0)

export const useSimpluxContext = () => useContext(SimpluxContext)

export const useSimpluxSubscription = (
  getStoreProxy: () => InternalReduxStoreProxy,
): SimpluxContextValue => {
  const [moduleStates, setModuleStates] = useState<ModuleStates>(() =>
    getStoreProxy().getState(),
  )

  const subscribers = useMemo<ModuleSubscribers>(() => ({}), [])

  useEffect(() => {
    let previousModuleStates = moduleStates
    let currentModuleStates = moduleStates

    return getStoreProxy().subscribe(() => {
      previousModuleStates = currentModuleStates
      currentModuleStates = getStoreProxy().getState()

      unstable_batchedUpdates(() => {
        setModuleStates(currentModuleStates)

        for (const moduleName of Object.keys(subscribers)) {
          for (const subscriber of subscribers[moduleName]) {
            subscriber(
              currentModuleStates[moduleName],
              previousModuleStates[moduleName],
            )
          }
        }
      })
    })
  }, [])

  function getModuleState<TState>(simpluxModule: SimpluxModule<TState>) {
    return (
      simpluxModule.$simpluxInternals.mockStateValue ||
      moduleStates[simpluxModule.$simpluxInternals.name] ||
      simpluxModule.getState()
    )
  }

  type Subscribe = SimpluxContextValue['subscribeToModuleStateChanges']
  const subscribeToModuleStateChanges = useCallback<Subscribe>(
    (simpluxModule, handler) => {
      const moduleName = simpluxModule.$simpluxInternals.name
      const moduleState = getModuleState(simpluxModule)

      subscribers[moduleName] = subscribers[moduleName] || new Set()
      subscribers[moduleName].add(handler)

      handler(moduleState, moduleState)

      return () => subscribers[moduleName].delete(handler)
    },
    [],
  )

  return {
    getModuleState,
    subscribeToModuleStateChanges,
  }
}

export const SimpluxProvider: FC = ({ children }) => {
  const contextValue = useSimpluxSubscription(getInternalReduxStoreProxy)

  return (
    <SimpluxContext.Provider value={contextValue}>
      {children}
    </SimpluxContext.Provider>
  )
}

import {
  getInternalReduxStoreProxy,
  Immutable,
  InternalReduxStoreProxy,
  SimpluxModule,
} from '@simplux/core'
import React, {
  Context,
  createContext as createContextReact,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { unstable_batchedUpdates } from 'react-dom'

// required since React typings to not include the second parameter
type CreateContextFn = <T>(
  defaultValue: T,
  calculateChangedBits: () => number,
) => Context<T>

const createContext = createContextReact as CreateContextFn

export interface SimpluxContextValue {
  subscribeToModuleStateChanges: <TState>(
    simpluxModule: SimpluxModule<TState>,
    handler: (
      state: Immutable<TState>,
      previousState: Immutable<TState>,
    ) => void,
  ) => () => void

  getModuleState: <TState>(
    simpluxModule: SimpluxModule<TState>,
  ) => Immutable<TState>
}

interface ModuleStates {
  [moduleName: string]: any
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

// we only support accessing the context via the useSimplux hook
delete (SimpluxContext as Partial<typeof SimpluxContext>).Consumer

export const useSimpluxContext = () => useContext(SimpluxContext)

export const useSimpluxSubscription = (
  getStoreProxy: () => InternalReduxStoreProxy,
): SimpluxContextValue => {
  const [moduleStates, setModuleStates] = useState<ModuleStates>(() =>
    getStoreProxy().getState(),
  )

  const subscribers = useMemo(
    () => new Map<string, Set<(state: any, previousState: any) => void>>(),
    [],
  )

  useEffect(() => {
    let previousModuleStates = moduleStates
    let currentModuleStates = moduleStates

    return getStoreProxy().subscribe(() => {
      previousModuleStates = currentModuleStates
      currentModuleStates = getStoreProxy().getState()

      unstable_batchedUpdates(() => {
        setModuleStates(currentModuleStates)

        subscribers.forEach((moduleSubscribers, moduleName) => {
          const currentState = currentModuleStates[moduleName]
          const prevState = previousModuleStates[moduleName]

          if (currentState !== prevState) {
            moduleSubscribers.forEach(sub => sub(currentState, prevState))
          }
        })
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

      if (!subscribers.has(moduleName)) {
        subscribers.set(moduleName, new Set())
      }

      subscribers.get(moduleName)!.add(handler)

      handler(moduleState, moduleState)

      return () => subscribers.get(moduleName)!.delete(handler)
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

import {
  Immutable,
  SimpluxModule,
  StateChangeHandler,
  _getStoreProxy,
  _InternalReduxStoreProxy,
} from '@simplux/core'
import React, {
  Context,
  createContext,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { unstable_batchedUpdates } from 'react-dom'

// required since React typings to not include the second parameter
type CreateContextFn = <T>(
  defaultValue: T,
  calculateChangedBits: () => number,
) => Context<T>

export interface SimpluxContextValue {
  subscribeToModuleStateChanges: <TState>(
    simpluxModule: SimpluxModule<TState>,
    handler: StateChangeHandler<TState>,
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
const defaultValue: SimpluxContextValue = {
  subscribeToModuleStateChanges(simpluxModule, handler) {
    return simpluxModule.subscribeToStateChanges(handler).unsubscribe
  },
  getModuleState: (simpluxModule) => simpluxModule.$simplux.getState(),
}

// by always returning 0 for `calculateChangedBits` we prevent components
// from re-rendering just because they access the context value; instead
// it is up to each component to decide when to render, the context is just
// responsible for providing a consistent state value during each render
// pass
const SimpluxContext = (createContext as CreateContextFn)(defaultValue, () => 0)

// we only support accessing the context via the useSimplux hook
delete (SimpluxContext as Partial<typeof SimpluxContext>).Consumer

export const useSimpluxContext = () => useContext(SimpluxContext)

export const useSimpluxSubscription = (
  getStoreProxy: () => _InternalReduxStoreProxy,
): SimpluxContextValue => {
  const [moduleStates, setModuleStates] = useState<ModuleStates>(() =>
    getStoreProxy().getState(),
  )

  const subscribers = new Map<
    string,
    Set<(state: any, previousState: any) => void>
  >()

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
            moduleSubscribers.forEach((sub) => sub(currentState, prevState))
          }
        })
      })
    })
  }, [])

  function getModuleState<TState>(simpluxModule: SimpluxModule<TState>) {
    return (
      simpluxModule.$simplux.mockStateValue ||
      moduleStates[simpluxModule.$simplux.name] ||
      simpluxModule.$simplux.getState()
    )
  }

  function subscribeToModuleStateChanges(
    simpluxModule: SimpluxModule<any>,
    handler: StateChangeHandler<any>,
  ) {
    const moduleName = simpluxModule.$simplux.name
    const moduleState = getModuleState(simpluxModule)

    if (!subscribers.has(moduleName)) {
      subscribers.set(moduleName, new Set())
    }

    subscribers.get(moduleName)!.add(handler)

    handler(moduleState, moduleState)

    return () => subscribers.get(moduleName)!.delete(handler)
  }

  return {
    getModuleState,
    subscribeToModuleStateChanges,
  }
}

/**
 * A provider for allowing components to use state from simplux modules.
 *
 * It is recommended to wrap your entire application with a single provider.
 *
 * @public
 */
export const SimpluxProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const contextValue = useSimpluxSubscription(_getStoreProxy)

  return (
    <SimpluxContext.Provider value={contextValue}>
      {children}
    </SimpluxContext.Provider>
  )
}

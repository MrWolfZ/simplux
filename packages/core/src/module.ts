import { SimpluxStore } from './store'

export interface SimpluxModuleConfig<TState> {
  name: string
  initialState: TState
}

export type StateChangeHandler<TState> = (state: TState) => void

export interface SimpluxModule<TState> {
  getState(): TState
  setState(state: TState): void
  subscribeToStateChanges(handler: StateChangeHandler<TState>): () => void
}

export type SimpluxModuleExtension<TReturn = object> = <TState>(
  config: SimpluxModuleConfig<TState>,
  store: SimpluxStore,
  moduleExtensionStateContainer: any,
) => TReturn

export const moduleExtensions: SimpluxModuleExtension[] = []

export function registerModuleExtension(extension: SimpluxModuleExtension) {
  moduleExtensions.push(extension)
  return () => {
    moduleExtensions.splice(moduleExtensions.indexOf(extension), 1)
  }
}

export function createModule<TState>(
  store: SimpluxStore,
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  const { getState, dispatch, subscribe, setReducer: addReducer } = store

  const getModuleState = () => getState()[config.name]
  const setModuleState = (state: TState) => {
    dispatch({
      type: `@simplux/${config.name}/setState`,
      state,
    })
  }

  let unsubscribe: (() => void) | undefined
  let latestModuleState = config.initialState
  const handlers: StateChangeHandler<TState>[] = []

  const subscribeToStateChanges = (handler: StateChangeHandler<TState>) => {
    handlers.push(handler)

    if (handlers.length === 1) {
      unsubscribe = subscribe(() => {
        const moduleState = getModuleState()

        if (moduleState !== latestModuleState) {
          latestModuleState = moduleState

          for (const handler of handlers) {
            handler(moduleState)
          }
        }
      })
    }

    return () => {
      handlers.splice(handlers.indexOf(handler), 1)

      if (handlers.length === 0 && unsubscribe) {
        unsubscribe()
        unsubscribe = undefined
      }
    }
  }

  addReducer(config.name, (s = config.initialState, { type, state }) =>
    type === `@simplux/${config.name}/setState` ? state : s,
  )

  const result = {
    getState: getModuleState,
    setState: setModuleState,
    subscribeToStateChanges,
  }

  const moduleExtensionStateContainer = {}
  return moduleExtensions.reduce(
    (acc, ext) => ({
      ...acc,
      ...ext(config, store, moduleExtensionStateContainer),
    }),
    result,
  ) as SimpluxModule<TState>
}

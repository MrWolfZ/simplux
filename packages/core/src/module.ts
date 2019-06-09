import { SimpluxStore } from './store'

export interface SimpluxModuleConfig<TState> {
  name: string
  initialState: TState
}

export type StateChangeHandler<TState> = (state: TState) => void
export type Unsubscribe = () => void
export type SubscribeToStateChanges<TState> = (
  handler: StateChangeHandler<TState>,
) => Unsubscribe

export interface SimpluxModuleCore<TState> {
  /**
   * Get the current module state.
   *
   * @returns the module state
   */
  getState(): TState

  /**
   * Replace the whole module state.
   *
   * @param state the state to set for the module
   */
  setState(state: TState): void

  /**
   * Register a handler to be called whenever the module's state
   * changes.
   *
   * @param handler the function to call whenever the module's state changes
   *
   * @returns an unsubscribe function that will remove the handler
   */
  subscribeToStateChanges: SubscribeToStateChanges<TState>
}

export interface SimpluxModule<TState> extends SimpluxModuleCore<TState> {}

export type SimpluxModuleExtension<TReturn = object> = <TState>(
  config: SimpluxModuleConfig<TState>,
  store: SimpluxStore,
  moduleCore: SimpluxModuleCore<TState>,
  moduleExtensionStateContainer: any,
) => TReturn

export const moduleExtensions: SimpluxModuleExtension[] = []

export function registerModuleExtension(extension: SimpluxModuleExtension) {
  moduleExtensions.push(extension)
  return () => {
    const idx = moduleExtensions.indexOf(extension)
    if (idx >= 0) {
      moduleExtensions.splice(idx, 1)
    }
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
      const idx = handlers.indexOf(handler)
      if (idx >= 0) {
        handlers.splice(idx, 1)
      }

      if (handlers.length === 0 && unsubscribe) {
        unsubscribe()
        unsubscribe = undefined
      }
    }
  }

  addReducer(config.name, (s = config.initialState, { type, state }) =>
    type === `@simplux/${config.name}/setState` ? state : s,
  )

  const result: SimpluxModuleCore<TState> = {
    getState: getModuleState,
    setState: setModuleState,
    subscribeToStateChanges,
  }

  const moduleExtensionStateContainer = {}
  const finalModule = moduleExtensions.reduce(
    (acc, ext) => ({
      ...acc,
      ...ext(config, store, acc, moduleExtensionStateContainer),
    }),
    result,
  ) as SimpluxModule<TState>

  return finalModule
}

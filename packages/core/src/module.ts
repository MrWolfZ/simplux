import { removeChildReducer } from './reducer'
import { ReduxStoreProxy, storeProxy } from './store'

const { dispatch, getState: getStoreState, setChildReducer } = storeProxy

export interface SimpluxModuleConfig<TState> {
  name: string
  initialState: TState
}

export interface SimpluxModule<TState> {
  getState(): TState
  setState(state: TState): void
}

export type SimpluxModuleExtension<TReturn = object> = <TState>(
  config: SimpluxModuleConfig<TState>,
  storeProxy: ReduxStoreProxy,
  moduleExtensionStateContainer: any,
) => TReturn

export const moduleExtensions: SimpluxModuleExtension[] = []

export function registerModuleExtension(extension: SimpluxModuleExtension) {
  moduleExtensions.push(extension)
  return () => {
    moduleExtensions.splice(moduleExtensions.indexOf(extension), 1)
  }
}

export function getModuleState(moduleName: string) {
  return getStoreState()[moduleName]
}

export function createModule<TState>(
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {

  const getState = () => getModuleState(config.name)
  const setState = (state: TState) => { dispatch({ type: `@simplux/${config.name}/setState`, state }) }

  setChildReducer(config.name, (s = config.initialState, { type, state }) => type === `@simplux/${config.name}/setState` ? state : s)
  setState(config.initialState)

  const result = {
    getState,
    setState,
  }

  const moduleExtensionStateContainer = {}
  return moduleExtensions.reduce((acc, ext) => ({ ...acc, ...ext(config, storeProxy, moduleExtensionStateContainer) }), result) as SimpluxModule<TState>
}

export function removeModule(moduleName: string): void {
  removeChildReducer(moduleName)
}

import {
  createModule,
  registerModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
} from './src/module'
import { mutationsModuleExtension } from './src/mutations'
import { simpluxStore } from './src/store'

registerModuleExtension(mutationsModuleExtension)

export {
  registerModuleExtension as registerSimpluxModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleCore,
  SimpluxModuleExtension,
  StateChangeHandler,
  SubscribeToStateChanges,
  Unsubscribe,
} from './src/module'
export {
  MutationBase,
  MutationReturnType,
  MutationReturnTypeOverride,
  MutationsBase,
  MutationsFactory,
  ResolvedMutation,
  ResolvedMutationExtras,
  ResolvedMutations,
  SimpluxModuleMutationExtensions,
} from './src/mutations'
export {
  setReduxStore as setReduxStoreForSimplux,
  SimpluxStore,
} from './src/store'

export function getSimpluxReducer() {
  return simpluxStore.rootReducer
}

export function createSimpluxModule<TState>(
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  return createModule(simpluxStore, config)
}

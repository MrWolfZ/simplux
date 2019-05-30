import {
  createModule,
  registerModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
} from './src/module'
import { mutationsModuleExtension } from './src/mutations'
import { getSimpluxStore } from './src/store'

registerModuleExtension(mutationsModuleExtension)

export {
  registerModuleExtension as registerSimpluxModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleCore,
  SimpluxModuleExtension,
  StateChangeHandler,
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
  getSimpluxStore,
  SimpluxStore,
  useExistingStore as useSimpluxWithExistingStore,
} from './src/store'

export function getSimpluxReducer() {
  return getSimpluxStore().rootReducer
}

export function createSimpluxModule<TState>(
  config: SimpluxModuleConfig<TState>,
): SimpluxModule<TState> {
  return createModule(getSimpluxStore(), config)
}

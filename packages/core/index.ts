import { registerModuleExtension } from './src/module'
import { mutationsModuleExtension } from './src/mutations'

registerModuleExtension(mutationsModuleExtension)

export {
  getStore as getReduxStore,
  useExistingStore as useSimpluxWithExistingStore,
  ReduxStoreProxy,
} from './src/store'

export {
  getRootReducer as getSimpluxReducer,
  setChildReducer as addReducerToSimpluxReducer,
} from './src/reducer'

export {
  createModule as createSimpluxModule,
  registerModuleExtension as registerSimpluxModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleExtension,
} from './src/module'

export {
  MutationBase,
  MutationReturnType,
  MutationReturnTypeOverride,
  MutationsBase,
  MutationsFactory,
  ResolvedMutation,
  ResolvedMutations,
  ResolvedMutationExtras,
  SimpluxModuleMutationExtensions,
} from './src/mutations'

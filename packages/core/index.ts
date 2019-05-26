import { registerModuleExtension } from './src/module'
import { mutationsModuleExtension } from './src/mutations'

registerModuleExtension(mutationsModuleExtension)

export {
  createModule as createSimpluxModule,
  registerModuleExtension as registerSimpluxModuleExtension,
  SimpluxModule,
  SimpluxModuleConfig,
  SimpluxModuleExtension
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
  SimpluxModuleMutationExtensions
} from './src/mutations'
export {
  getRootReducer as getSimpluxReducer,
  setChildReducer as addReducerToSimpluxReducer
} from './src/reducer'
export {
  getStore as getReduxStore,
  ReduxStoreProxy,
  useExistingStore as useSimpluxWithExistingStore
} from './src/store'

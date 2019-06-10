import { registerSimpluxModuleExtension } from '@simplux/core'
import { reactModuleExtension } from './src/hooks'

export { SimpluxModuleReactExtensions } from './src/hooks'
export {
  SimpluxModuleSelectorHook,
  SimpluxModuleSelectorHookExtras,
  SimpluxModuleSelectorHookWithExtras,
} from './src/useModuleSelector'

registerSimpluxModuleExtension(reactModuleExtension, 130)

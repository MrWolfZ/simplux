import { registerSimpluxModuleExtension } from '@simplux/core'
import { reactModuleExtension } from './src/hooks'

export {
  SimpluxModuleReactExtensions,
  SimpluxModuleSelectorHook,
  SimpluxModuleSelectorHookExtras,
} from './src/hooks'

registerSimpluxModuleExtension(reactModuleExtension, 130)

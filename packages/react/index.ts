import { registerSimpluxModuleExtension } from '@simplux/core'
import { reactModuleExtension } from './src/hooks'

export {
  SimpluxModuleReactExtensions,
  SimpluxModuleSelectorHook,
} from './src/hooks'

registerSimpluxModuleExtension(reactModuleExtension)

import { registerSimpluxModuleExtension } from '@simplux/core'
import { observeModuleExtension } from './src/observe'

export { SimpluxModuleObserveExtensions } from './src/observe'

registerSimpluxModuleExtension(observeModuleExtension, 140)

import { registerSimpluxModuleExtension } from '@simplux/core'
import { reactHooksTestingModuleExtension } from './src/hooks'

export { SimpluxModuleSelectorHookTestingExtras } from './src/useModuleSelector'

registerSimpluxModuleExtension(reactHooksTestingModuleExtension, 230)

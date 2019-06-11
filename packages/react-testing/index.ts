import { registerSimpluxModuleExtension } from '@simplux/core'
import { reactHooksTestingModuleExtension } from './src/hooks'

export {
  mockSelectorHookState,
  mockSelectorHookStateForNextRender,
  removeAllSelectorHookMockStates,
  removeSelectorHookMockState,
} from './src/useModuleSelector'

registerSimpluxModuleExtension(reactHooksTestingModuleExtension, 230)

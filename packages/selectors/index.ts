import { registerSimpluxModuleExtension } from '@simplux/core'
import { selectorsModuleExtension } from './src/selectors'

export {
  ResolvedSelector,
  ResolvedSelectorExtras,
  ResolvedSelectors,
  SelectorBase,
  SelectorsBase,
  SelectorsFactory,
  SimpluxModuleSelectorExtensions,
} from './src/selectors'

registerSimpluxModuleExtension(selectorsModuleExtension, 120)

import { registerSimpluxModuleExtension } from '@simplux/core'
import { selectorsModuleExtension } from './src/selectors'

registerSimpluxModuleExtension(selectorsModuleExtension)

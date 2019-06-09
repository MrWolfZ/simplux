import { registerSimpluxModuleExtension } from '@simplux/core'
import { mutationsTestingModuleExtension } from './src/mutations'

registerSimpluxModuleExtension(mutationsTestingModuleExtension, 200)

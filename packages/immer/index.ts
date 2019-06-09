import { registerSimpluxModuleExtension } from '@simplux/core'
import { immerModuleExtension } from './src/immer'

export { ImmerMutationReturnTypeOverride } from './src/immer'

registerSimpluxModuleExtension(immerModuleExtension, 110)

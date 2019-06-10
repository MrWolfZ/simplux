import { registerSimpluxModuleExtension } from '@simplux/core'
import { mutationsTestingModuleExtension } from './src/mutations'

export { MutationsMocks, ResolvedMutationTestingExtras } from './src/mutations'

registerSimpluxModuleExtension(mutationsTestingModuleExtension, 200)

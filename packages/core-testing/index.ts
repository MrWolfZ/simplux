import { registerSimpluxModuleExtension } from '@simplux/core'
import { mutationsTestingModuleExtension } from './src/mutations'

export {
  mockMutation,
  mockMutationOnce,
  MutationsMocks,
  removeAllMutationMocks,
  removeMutationMock,
} from './src/mutations'

registerSimpluxModuleExtension(mutationsTestingModuleExtension, 200)

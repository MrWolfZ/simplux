import { registerSimpluxModuleExtension } from '@simplux/core'
import { immerModuleExtension } from './src/immer'

export function registerSimpluxImmerExtension() {
  return registerSimpluxModuleExtension(immerModuleExtension)
}

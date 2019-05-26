import { registerSimpluxModuleExtension } from '@simplux/core'
import { selectorsModuleExtension } from './src/selectors'

export function registerSimpluxSelectExtension() {
  return registerSimpluxModuleExtension(selectorsModuleExtension)
}

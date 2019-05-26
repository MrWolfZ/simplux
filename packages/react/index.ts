import { registerSimpluxModuleExtension } from '@simplux/core'
import { reactHooksModuleExtension } from './src/hooks'

export function registerSimpluxReactExtension() {
  return registerSimpluxModuleExtension(reactHooksModuleExtension)
}

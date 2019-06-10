import { SimpluxModuleExtension } from '@simplux/core'
import { SimpluxModuleReactExtensions } from '@simplux/react'
import { createSelectorHookWithTestingExtras } from './useModuleSelector'

export const reactHooksTestingModuleExtension: SimpluxModuleExtension<
  SimpluxModuleReactExtensions<any>
> = ({ name }, _2, module: any, extensionState) => {
  extensionState.reactHooksMocks = extensionState.reactHooksMocks || {}
  extensionState.reactHooksMocks[name] =
    extensionState.reactHooksMocks[name] || {}
  extensionState.reactHooksMocks[name].selectorHook =
    extensionState.reactHooksMocks[name].selectorHook || {}

  const mutationExtension = module as SimpluxModuleReactExtensions<any>
  const originalHooks = mutationExtension.react.hooks

  return {
    react: {
      ...mutationExtension.react,
      hooks: {
        ...originalHooks,
        useSelector: createSelectorHookWithTestingExtras(
          originalHooks.useSelector,
          extensionState.reactHooksMocks[name].selectorHook,
        ),
      },
    },
  }
}

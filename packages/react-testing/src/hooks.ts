import { SimpluxModuleExtension } from '@simplux/core'
import { SimpluxModuleReactExtensions } from '@simplux/react'
import { createSelectorHookWithTestingExtras } from './useModuleSelector'

export const reactHooksTestingModuleExtension: SimpluxModuleExtension<
  SimpluxModuleReactExtensions<any>
> = ({ name }, _2, module: any) => {
  const mutationExtension = module as SimpluxModuleReactExtensions<any>
  const originalHooks = mutationExtension.react.hooks

  return {
    react: {
      ...mutationExtension.react,
      hooks: {
        ...originalHooks,
        useSelector: createSelectorHookWithTestingExtras(
          name,
          originalHooks.useSelector,
        ),
      },
    },
  }
}

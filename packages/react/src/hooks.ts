import { SimpluxModuleExtension } from '@simplux/core'
import {
  createSelectorHook,
  SimpluxModuleSelectorHook,
  SimpluxModuleSelectorHookExtras,
} from './useModuleSelector'

export interface SimpluxModuleReactExtensions<TState> {
  react: {
    hooks: {
      /**
       * A react hook that allows accessing the module's state inside
       * a component.
       *
       * @param selector a function that selects some derived state from
       * the module's state
       *
       * @returns the selected value
       */
      useSelector: SimpluxModuleSelectorHook<TState> &
        SimpluxModuleSelectorHookExtras;
    };
  }
}

declare module '@simplux/core' {
  interface SimpluxModule<TState>
    extends SimpluxModuleReactExtensions<TState> {}
}

export const reactModuleExtension: SimpluxModuleExtension<
  SimpluxModuleReactExtensions<any>
> = ({ name }, _2, { getState, subscribeToStateChanges }) => {
  return {
    react: {
      hooks: {
        useSelector: createSelectorHook(
          name,
          getState,
          subscribeToStateChanges,
        ),
      },
    },
  }
}

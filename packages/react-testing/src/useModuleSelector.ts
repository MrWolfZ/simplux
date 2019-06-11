import {
  SimpluxModuleSelectorHook,
  SimpluxModuleSelectorHookWithExtras,
} from '@simplux/react'
import { useEffect } from 'react'

export interface SelectorHookMocks {
  [moduleName: string]: {
    mockedStateValue?: any;
    mockedStateValueForRender?: any;
  }
}

let selectorHookMocks: SelectorHookMocks = {}

export function createSelectorHookWithTestingExtras<TState>(
  moduleName: string,
  originalHook: SimpluxModuleSelectorHookWithExtras<TState>,
): SimpluxModuleSelectorHookWithExtras<TState> {
  const testHook: SimpluxModuleSelectorHook<TState> = selector => {
    const moduleMocks = selectorHookMocks[moduleName]

    useEffect(() => {
      if (moduleMocks) {
        delete selectorHookMocks[moduleName].mockedStateValueForRender
      }
    }, [])

    if (moduleMocks) {
      if (moduleMocks.mockedStateValue) {
        return selector(moduleMocks.mockedStateValue)
      }

      if (moduleMocks.mockedStateValueForRender) {
        return selector(moduleMocks.mockedStateValueForRender)
      }
    }

    return originalHook(selector)
  }

  const testHookWithExtras = testHook as SimpluxModuleSelectorHookWithExtras<
    TState
  >

  for (const hookExtra of Object.keys(originalHook)) {
    (testHookWithExtras as any)[hookExtra] =
      originalHook[hookExtra as keyof typeof originalHook]
  }

  return testHookWithExtras
}

/**
 * Specify a mock state value that should be passed to the selector
 * for a given hook instead of the real module's state value.
 *
 * @param selectorHook the hook to make the state value for
 * @param mockStateValue the mock state value to use
 */
export function mockSelectorHookState<TState>(
  selectorHook: SimpluxModuleSelectorHookWithExtras<TState>,
  mockStateValue: TState,
): void {
  selectorHookMocks[selectorHook.moduleName] = {
    mockedStateValue: mockStateValue,
  }
}

/**
 * Specify a mock state value that should be passed to the selector
 * for a given selector hook instead of the real module's state value.
 *
 * The mocked state is automatically removed once the next render
 * in which the hook is used has completed.
 *
 * @param selectorHook the hook to make the state value for
 * @param mockStateValue the mock state value to use
 */
export function mockSelectorHookStateForNextRender<TState>(
  selectorHook: SimpluxModuleSelectorHookWithExtras<TState>,
  mockStateValue: TState,
): void {
  selectorHookMocks[selectorHook.moduleName] = {
    mockedStateValueForRender: mockStateValue,
  }
}

/**
 * Remove any mock state that may currently be set for a given
 * selector hook. Does nothing if no mock state is set.
 */
export function removeSelectorHookMockState<TState>(
  selectorHook: SimpluxModuleSelectorHookWithExtras<TState>,
): void {
  delete selectorHookMocks[selectorHook.moduleName]
}

/**
 * Remove all mock states that are currently set for any
 * selector hook.
 */
export function removeAllSelectorHookMockStates(): void {
  selectorHookMocks = {}
}

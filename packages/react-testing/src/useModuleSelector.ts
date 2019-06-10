import {
  SimpluxModuleSelectorHook,
  SimpluxModuleSelectorHookWithExtras,
} from '@simplux/react'
import { useEffect } from 'react'

export interface SelectorHookMocks<TState> {
  mockedStateValue?: TState
  mockedStateValueForRender?: TState
}

export function createSelectorHookWithTestingExtras<TState>(
  originalHook: SimpluxModuleSelectorHookWithExtras<TState>,
  selectorHookMocks: SelectorHookMocks<TState>,
): SimpluxModuleSelectorHookWithExtras<TState> {
  const testHook: SimpluxModuleSelectorHook<TState> = selector => {
    useEffect(() => {
      delete selectorHookMocks.mockedStateValueForRender
    }, [])

    if (selectorHookMocks.mockedStateValue) {
      return selector(selectorHookMocks.mockedStateValue)
    }

    if (selectorHookMocks.mockedStateValueForRender) {
      return selector(selectorHookMocks.mockedStateValueForRender)
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

  testHookWithExtras.mockState = mockStateValue => {
    selectorHookMocks.mockedStateValue = mockStateValue
  }

  testHookWithExtras.mockStateForNextRender = mockStateValue => {
    selectorHookMocks.mockedStateValueForRender = mockStateValue
  }

  testHookWithExtras.removeMockState = () => {
    delete selectorHookMocks.mockedStateValue
  }

  return testHookWithExtras
}

export interface SimpluxModuleSelectorHookTestingExtras<TState> {
  /**
   * Specify a mock state value that should be passed to the selector
   * instead of the real module state value.
   *
   * @param mockStateValue the mock state value to use
   */
  mockState(mockStateValue: TState): void

  /**
   * Specify a mock state value that should be passed to the selector
   * instead of the real module state value.
   *
   * The mock is automatically removed once the next render in which
   * it is used is finished.
   *
   * @param mockStateValue the mock state value to use
   */
  mockStateForNextRender(mockStateValue: TState): void

  /**
   * Remove any mock state that may currently be set. Does nothing if
   * no mock state is set.
   */
  removeMockState(): void
}

declare module '@simplux/react' {
  export interface SimpluxModuleSelectorHookExtras<TState>
    extends SimpluxModuleSelectorHookTestingExtras<TState> {}
}

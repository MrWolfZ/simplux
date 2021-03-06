import type {
  SimpluxModule,
  SimpluxSelector,
  SimpluxSelectorMarker,
} from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup.js'

function setupMutationMock<
  TState,
  TArgs extends any[],
  TReturn,
  TMock extends (...args: TArgs) => TReturn
>(
  owningModule: SimpluxModule<TState>,
  selectorId: number,
  mockFn: TMock,
): [TMock, () => void] {
  const internals = owningModule.$simplux

  const cleanup = () => {
    delete internals.selectorMocks?.[selectorId]
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  internals.selectorMocks = internals.selectorMocks || {}
  internals.selectorMocks[selectorId] = mockFn as any

  return [mockFn, cleanup]
}

/**
 * Specify a mock function that should be called instead of the
 * selector. The selector will stay mocked indefinitely until either
 * the clear callback or `clearAllSimpluxMocks` is called.
 *
 * @param selector - the selector to mock
 * @param mockFn - the mock function to use
 *
 * @returns a function that clears the mock when called
 *
 * @public
 */
export function mockSelector<
  TState,
  TArgs extends any[],
  TReturn,
  TMock extends (...args: TArgs) => TReturn
>(selector: SimpluxSelectorMarker<TState, TArgs, TReturn>, mockFn: TMock) {
  const sel = selector as SimpluxSelector<TState, TArgs, TReturn>

  return setupMutationMock<TState, TArgs, TReturn, TMock>(
    sel.owningModule,
    sel.selectorId,
    mockFn,
  )
}

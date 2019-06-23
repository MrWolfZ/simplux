import { ResolvedAsyncTaskInternals } from '@simplux/async'
import { SimpluxModule, SimpluxModuleInternals } from '@simplux/core'
import { registerMockCleanupFunction } from './cleanup'

export function setupAsyncTaskMock<
  TState,
  TArgs extends any[],
  TReturn,
  TMock extends (...args: TArgs) => Promise<TReturn>
>(owningModule: SimpluxModule<TState>, taskName: string, mockFn: TMock) {
  const {
    extensionStateContainer,
  } = (owningModule as unknown) as SimpluxModuleInternals

  const moduleTaskMocks = extensionStateContainer.asyncTaskMocks as {
    [taskName: string]: (...args: TArgs) => Promise<TReturn>;
  }

  const cleanup = () => {
    delete moduleTaskMocks[taskName]
    clearCleanup()
  }

  const clearCleanup = registerMockCleanupFunction(cleanup)

  moduleTaskMocks[taskName] = mockFn

  return cleanup
}

/**
 * Specify a mock function that should be called instead of the
 * async task.The task will stay mocked indefinitely until either
 * the clear callback or `clearAllSimpluxMocks` is called.
 *
 * @param asyncTask the async task to mock
 * @param mockFn the mock function to use
 *
 * @returns a function that clears the mock when called
 */
export function mockAsyncTask<
  TState,
  TArgs extends any[],
  TReturn,
  TMock extends (...args: TArgs) => Promise<TReturn>
>(asyncTask: (...args: TArgs) => Promise<TReturn>, mockFn: TMock) {
  const {
    owningModule,
    taskName,
  } = (asyncTask as unknown) as ResolvedAsyncTaskInternals<TState>

  return setupAsyncTaskMock<TState, TArgs, TReturn, TMock>(
    owningModule,
    taskName,
    mockFn,
  )
}

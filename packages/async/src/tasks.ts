import { SimpluxModule, SimpluxModuleInternals } from '@simplux/core'

export type AsyncTaskBase<TReturn> = (
  // optimally, we would use ...args: any[] but that does not work correctly with
  // TypeScript 3.3.3 so we use this workaround
  arg1?: any,
  arg2?: any,
  arg3?: any,
  arg4?: any,
  arg5?: any,
  arg6?: any,
  arg7?: any,
  arg8?: any,
  arg9?: any,
) => Promise<TReturn>

export interface AsyncTasksBase {
  [name: string]: AsyncTaskBase<any>
}

export type ResolvedAsyncTask<
  TAsyncTask extends AsyncTaskBase<ReturnType<TAsyncTask>>
> = TAsyncTask extends (...args: infer TArgs) => Promise<infer TReturn>
  ? ((...args: TArgs) => Promise<TReturn>)
  : never

export type ResolvedAsyncTasks<TAsyncTasks extends AsyncTasksBase> = {
  [name in keyof TAsyncTasks]: ResolvedAsyncTask<TAsyncTasks[name]>
}

/**
 * @private
 */
export interface ResolvedAsyncTaskInternals<TState> {
  /**
   * The name of this async task. This is part of the simplux internal API
   * and should not be accessed except by simplux extensions.
   *
   * @private
   */
  taskName: string

  /**
   * The module this async task belongs to. This is part of the simplux
   * internal API and should not be accessed except by simplux extensions.
   *
   * @private
   */
  owningModule: SimpluxModule<TState>
}

// this helper function allows creating a function with a dynamic name
function nameFunction<T extends (...args: any[]) => any>(
  name: string,
  body: T,
): T {
  return {
    [name](...args: any[]) {
      return body(...args)
    },
  }[name] as T
}

/**
 * Create new async tasks for the module. An async task is an
 * asynchronous function that takes some parameters and returns
 * a promise.
 *
 * @param simpluxModule the module to create async tasks for
 * @param asyncTasks the async tasks to create
 *
 * @returns an object that contains a function for each provided
 * async task
 */
export function createAsyncTasks<TState, TAsyncTasks extends AsyncTasksBase>(
  simpluxModule: SimpluxModule<TState>,
  asyncTasks: TAsyncTasks,
): ResolvedAsyncTasks<TAsyncTasks> {
  const moduleName = simpluxModule.name
  const {
    extensionStateContainer,
  } = (simpluxModule as any) as SimpluxModuleInternals

  const moduleTasks = (extensionStateContainer.asyncTasks ||
    {}) as AsyncTasksBase

  extensionStateContainer.asyncTasks = moduleTasks

  const taskMocksContainer = (extensionStateContainer.asyncTaskMocks || {}) as {
    [taskName: string]: (...args: any[]) => Promise<any>;
  }

  extensionStateContainer.asyncTaskMocks = taskMocksContainer

  for (const taskName of Object.keys(asyncTasks)) {
    if (moduleTasks[taskName]) {
      throw new Error(
        `async task '${taskName}' is already defined for module '${moduleName}'`,
      )
    }
  }

  Object.assign(moduleTasks, asyncTasks)

  const resolvedTasks = Object.keys(asyncTasks).reduce(
    (acc, taskName: keyof TAsyncTasks) => {
      const namedTask = nameFunction(taskName as string, (...args: any[]) => {
        const mock = taskMocksContainer[taskName as string]
        if (mock) {
          return mock(...args)
        }

        return moduleTasks[taskName as string](...args)
      }) as ResolvedAsyncTask<TAsyncTasks[typeof taskName]>

      acc[taskName] = namedTask

      const internals = (namedTask as unknown) as ResolvedAsyncTaskInternals<
        TState
      >

      internals.taskName = taskName as string
      internals.owningModule = simpluxModule

      return acc
    },
    {} as ResolvedAsyncTasks<TAsyncTasks>,
  )

  return resolvedTasks
}

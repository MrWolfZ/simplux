import { isSimpluxModule, SimpluxModule, SimpluxSelector } from '@simplux/core'
import { useEffect, useMemo, useReducer } from 'react'
import { useSimpluxContext } from './context'

/**
 * A react hook that allows accessing a module's state inside
 * a component. Whenever the state of the module changes the
 * component using the hook will be re-rendered.
 *
 * @param simpluxModule the module to return the state for
 *
 * @returns the state of the module
 */
export function useSimplux<TState>(simpluxModule: SimpluxModule<TState>): TState

/**
 * A react hook that allows accessing a module's state inside
 * a component. Whenever the result of the selector changes the
 * component using the hook will be re-rendered.
 *
 * Note that for optimal performance the selector reference
 * should not change between invocations, for example by using
 * `useCallback` to create the selector.
 *
 * @param simpluxModule the module to return the state for
 * @param selector the selector that determines the slice
 * of the module's state which is returned
 *
 * @returns the result of the selector
 */
export function useSimplux<TState, TResult>(
  simpluxModule: SimpluxModule<TState>,
  selector: (state: TState) => TResult,
): TState

/**
 * A react hook that allows accessing a module's state inside
 * a component. Whenever the result of the selector changes the
 * component using the hook will be re-rendered.
 *
 * @param selector the module selector that determines the slice
 * of the module's state which is returned
 * @param args the arguments for the selector
 *
 * @returns the result of the selector
 */
export function useSimplux<TState, TArgs extends any[], TResult>(
  selector: SimpluxSelector<TState, TArgs, TResult>,
  ...args: TArgs
): TResult

export function useSimplux<TState, TArgs extends any[], TResult>(
  selectorOrModule:
    | SimpluxSelector<TState, TArgs, TResult>
    | SimpluxModule<TState>,
  selectorOrArg?: any,
  ...args: TArgs
): TResult {
  if (isSimpluxModule(selectorOrModule)) {
    const selector = typeof selectorOrArg === 'function' ? selectorOrArg : id
    const result = useSimpluxInternal(selectorOrModule, selector, [])
    return (result as unknown) as TResult
  }

  return useSimpluxInternal(
    selectorOrModule.owningModule,
    selectorOrModule.withState,
    [selectorOrArg, ...args] as TArgs,
  )
}

export function useSimpluxInternal<TState, TArgs extends any[], TResult>(
  module: SimpluxModule<TState>,
  selector: (state: TState, ...args: TArgs) => TResult,
  args: TArgs,
): TResult {
  const [, forceRender] = useReducer((s: number) => s + 1, 0)

  const context = useSimpluxContext()

  const memoizingSelector = useMemo(() => {
    let memoizedState: TState | undefined
    let memoizedResult: TResult | undefined

    return (state: TState) => {
      if (state === memoizedState) {
        return memoizedResult!
      }

      const result = selector(state, ...args)

      memoizedState = state
      memoizedResult = result

      return result
    }
  }, [selector, ...args])

  const selectedState = memoizingSelector(context.getModuleState(module))

  useEffect(() => {
    let previousSelectedState = selectedState
    let hadError = false

    function checkForUpdates(state: TState) {
      try {
        const newSelectedState = memoizingSelector(state)

        if (newSelectedState === previousSelectedState && !hadError) {
          return
        }

        previousSelectedState = newSelectedState
        hadError = false
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selector is called again, and
        // will throw again, if neither args nor module state
        // changed
        hadError = true
      }

      forceRender({})
    }

    return context.subscribeToModuleStateChanges(module, checkForUpdates)
  }, [memoizingSelector])

  return selectedState
}

function id<T>(t: T) {
  return t
}

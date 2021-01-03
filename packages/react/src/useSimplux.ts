import {
  Immutable,
  SimpluxModule,
  SimpluxSelector,
  _isSimpluxModule,
} from '@simplux/core'
import { useEffect, useMemo, useReducer } from 'react'
import { useSimpluxContext } from './context.js'

/**
 * A react hook that allows accessing a module's state inside
 * a component. Whenever the state of the module changes the
 * component using the hook will be re-rendered.
 *
 * @param simpluxModule - the module to return the state for
 *
 * @returns the state of the module
 *
 * @public
 */
export function useSimplux<TState>(
  simpluxModule: SimpluxModule<TState>,
): Immutable<TState>

/**
 * A react hook that allows accessing a module's state inside
 * a component. Whenever the result of the selector changes the
 * component using the hook will be re-rendered.
 *
 * @param selector - the module selector that determines the slice
 * of the module's state which is returned
 * @param args - the arguments for the selector
 *
 * @returns the result of the selector
 *
 * @public
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
  if (_isSimpluxModule(selectorOrModule)) {
    const selector = typeof selectorOrArg === 'function' ? selectorOrArg : id
    const result = useSimpluxInternal(selectorOrModule, selector, [])
    return (result as unknown) as TResult
  }

  const module = selectorOrModule.owningModule
  const selector = selectorOrModule
  args = [selectorOrArg, ...args] as TArgs

  const selectorMocks = module.$simplux.selectorMocks || {}
  const selectorMock = selectorMocks[selectorOrModule.selectorId]

  if (selectorMock) {
    return selectorMock(...args)
  }

  return useSimpluxInternal(module, selector.withState, args)
}

export function useSimpluxInternal<TState, TArgs extends any[], TResult>(
  module: SimpluxModule<TState>,
  selector: (state: Immutable<TState>, ...args: TArgs) => TResult,
  args: TArgs,
): TResult {
  const [, forceRender] = useReducer((s: number) => s + 1, 0)

  const context = useSimpluxContext()

  const memoizingSelector = useMemo(() => {
    let memoizedState: Immutable<TState> | undefined
    let memoizedResult: TResult | undefined

    return (state: Immutable<TState>) => {
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

    function checkForUpdates(state: Immutable<TState>) {
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

      forceRender()
    }

    return context.subscribeToModuleStateChanges(module, checkForUpdates)
  }, [memoizingSelector])

  return selectedState
}

function id<T>(t: T) {
  return t
}

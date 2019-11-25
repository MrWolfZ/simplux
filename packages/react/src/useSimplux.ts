import { SimpluxSelector } from '@simplux/core'
import { useEffect, useMemo, useReducer } from 'react'
import { useSimpluxContext } from './context'

/**
 * A react hook that allows accessing a module's state inside
 * a component.
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

      const result = selector.withState(state, ...args)

      memoizedState = state
      memoizedResult = result

      return result
    }
  }, [selector, ...args])

  const selectedState = memoizingSelector(
    context.getModuleState(selector.owningModule),
  )

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

    return context.subscribeToModuleStateChanges(
      selector.owningModule,
      checkForUpdates,
    )
  }, [memoizingSelector])

  return selectedState
}

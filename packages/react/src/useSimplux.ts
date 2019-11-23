import { SimpluxSelector } from '@simplux/core'
import { useEffect, useReducer } from 'react'
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

  const selectedState = selector.withState(
    context.getModuleState(selector.owningModule),
    ...args,
  )

  useEffect(() => {
    function checkForUpdates(state: TState) {
      try {
        const newSelectedState = selector.withState(state, ...args)

        if (newSelectedState === selectedState) {
          return
        }
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selector is called again, and
        // will throw again, if neither args nor module state
        // changed
      }

      forceRender({})
    }

    return context.subscribeToModuleStateChanges(
      selector.owningModule,
      checkForUpdates,
    )
  }, [selectedState, selector, ...args])

  return selectedState
}

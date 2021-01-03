import {
  Immutable,
  SimpluxModule,
  SimpluxSelector,
  _isSimpluxModule,
} from '@simplux/core'
import { useEffect, useReducer } from 'react'
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
  ...args: TArgs
): TResult {
  const module = _isSimpluxModule(selectorOrModule)
    ? selectorOrModule
    : selectorOrModule.owningModule

  const selector = _isSimpluxModule(selectorOrModule)
    ? selectorOrModule.state
    : selectorOrModule

  const selectorMocks = module.$simplux.selectorMocks || {}
  const selectorMock = selectorMocks[selector.selectorId]

  if (selectorMock) {
    return selectorMock(...args)
  }

  return useSelector(selector as SimpluxSelector<TState, TArgs, TResult>, args)

  function useSelector<TState, TArgs extends any[], TResult>(
    selector: SimpluxSelector<TState, TArgs, TResult>,
    args: TArgs,
  ): TResult {
    const [, forceRender] = useReducer((s: number) => s + 1, 0)

    const context = useSimpluxContext()

    const selectedState = selector.withState(
      context.getModuleState(selector.owningModule),
      ...args,
    )

    useEffect(() => {
      let previousSelectedState = selectedState
      let hadError = false

      function checkForUpdates(state: Immutable<TState>) {
        try {
          const newSelectedState = selector.withState(state, ...args)

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

      return context.subscribeToModuleStateChanges(
        selector.owningModule,
        checkForUpdates,
      )
    }, [...args])

    return selectedState
  }
}

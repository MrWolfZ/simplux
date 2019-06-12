// this file contains an end-to-end test for the public API

import { createSimpluxModule } from '@simplux/core'
import '@simplux/react'
import {
  mockSelectorHookState,
  mockSelectorHookStateForNextRender,
  removeAllSelectorHookMockStates,
  removeSelectorHookMockState,
} from '@simplux/react-testing'
import { cleanup, render } from '@testing-library/react'
import { default as React, useCallback } from 'react'

describe(`@simplux/selectors`, () => {
  const moduleState = { count: 0 }

  afterEach(cleanup)

  it('works', () => {
    const {
      react: {
        hooks: { useSelector },
      },
    } = createSimpluxModule({
      name: 'todos',
      initialState: moduleState,
    })

    const renderedItems: number[] = []

    const Comp = () => {
      const selector = useCallback(
        ({ count }: typeof moduleState) => count + 1,
        [],
      )
      const value = useSelector(selector)
      renderedItems.push(value)
      return <div />
    }

    mockSelectorHookState(useSelector, { count: 10 })

    render(<Comp />)
    render(<Comp />)

    removeSelectorHookMockState(useSelector)

    mockSelectorHookStateForNextRender(useSelector, { count: 20 })

    render(<Comp />)

    render(<Comp />)

    expect(renderedItems).toEqual([11, 11, 21, 1])
  })

  it('works for multiple hooks', () => {
    const {
      react: {
        hooks: { useSelector },
      },
    } = createSimpluxModule({
      name: 'todos',
      initialState: moduleState,
    })

    const {
      react: {
        hooks: { useSelector: useSelector2 },
      },
    } = createSimpluxModule({
      name: 'todos2',
      initialState: moduleState,
    })

    const renderedItems: number[] = []

    const Comp = () => {
      const selector = useCallback(
        ({ count }: typeof moduleState) => count + 1,
        [],
      )
      const value = useSelector(selector)
      const value2 = useSelector2(selector)
      renderedItems.push(value, value2)
      return <div />
    }

    mockSelectorHookState(useSelector, { count: 10 })
    mockSelectorHookState(useSelector2, { count: 20 })

    render(<Comp />)
    render(<Comp />)

    removeAllSelectorHookMockStates()

    render(<Comp />)

    expect(renderedItems).toEqual([11, 21, 11, 21, 1, 1])
  })
})

// this file contains an end-to-end test for the public API

import { createSimpluxModule } from '@simplux/core'
import '@simplux/react'
import '@simplux/react-testing'
import { default as React, useCallback } from 'react'
import { cleanup, render } from 'react-testing-library'

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

    useSelector.mockState({ count: 10 })

    render(<Comp />)
    render(<Comp />)

    useSelector.removeMockState()

    useSelector.mockStateForNextRender({ count: 20 })

    render(<Comp />)

    render(<Comp />)

    expect(renderedItems).toEqual([11, 11, 21, 1])
  })
})

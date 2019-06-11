// this code is part of the simplux recipe "testing my React components that read and change state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state

import { mockMutationOnce } from '@simplux/core-testing'
import {
  mockSelectorHookState,
  mockSelectorHookStateForNextRender,
  removeAllSelectorHookMockStates,
  removeSelectorHookMockState,
} from '@simplux/react-testing'
import { cleanup, fireEvent, render } from '@testing-library/react'
import React from 'react'
import { Counter } from './counter'
import {
  getCounterValue,
  incrementBy,
  setCounterValue,
  useCounter,
} from './counter-module'

describe(Counter.name, () => {
  afterEach(cleanup)

  it('displays the value', () => {
    setCounterValue(10)

    const { getByText } = render(<Counter />)

    expect(getByText(/value:\s*10/g)).toBeDefined()
  })

  it('displays the value times two (mocked)', () => {
    mockSelectorHookState(useCounter, { value: 20 })

    const { getByText } = render(<Counter />)

    expect(getByText(/value \* 2:\s*40/g)).toBeDefined()
  })

  afterEach(() => {
    removeSelectorHookMockState(useCounter)

    removeAllSelectorHookMockStates()
  })

  it('displays the value times five (mocked during render)', () => {
    mockSelectorHookStateForNextRender(useCounter, { value: 30 })

    const { getByText } = render(<Counter />)

    expect(getByText(/value \* 5:\s*150/g)).toBeDefined()
  })

  it('triggers an increment when the "Increment" button is clicked', () => {
    setCounterValue(10)

    const { getByText } = render(<Counter />)

    fireEvent.click(getByText('Increment'))

    expect(getCounterValue()).toBe(11)
  })

  it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
    mockSelectorHookStateForNextRender(useCounter, { value: 10 })
    const incrementBySpy = mockMutationOnce(incrementBy, jest.fn())

    const { getByText } = render(<Counter />)

    fireEvent.click(getByText('Increment by 5'))

    expect(incrementBySpy).toHaveBeenCalledWith(5)
  })
})

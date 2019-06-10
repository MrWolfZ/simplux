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

  it('displays the value (mocked)', () => {
    useCounter.mockState({ value: 20 })

    const { getByText } = render(<Counter />)

    expect(getByText(/value:\s*20/g)).toBeDefined()
  })

  afterEach(() => {
    useCounter.removeMockState()
  })

  it('displays the value times two (mocked during render)', () => {
    useCounter.mockStateForNextRender({ value: 33 })

    const { getByText } = render(<Counter />)

    expect(getByText(/value \* 2:\s*66/g)).toBeDefined()
  })

  it('triggers an increment when the "Increment" button is clicked', () => {
    setCounterValue(10)

    const { getByText } = render(<Counter />)

    fireEvent.click(getByText('Increment'))

    expect(getCounterValue()).toBe(11)
  })

  it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
    useCounter.mockStateForNextRender({ value: 10 })
    const incrementBySpy = incrementBy.mockOnce(jest.fn())

    const { getByText } = render(<Counter />)

    fireEvent.click(getByText('Increment by 5'))

    expect(incrementBySpy).toHaveBeenCalledWith(5)
  })
})

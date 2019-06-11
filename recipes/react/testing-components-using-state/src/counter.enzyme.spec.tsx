import { shallow } from 'enzyme'
import React from 'react'
import { Counter } from './counter'
import {
  getCounterValue,
  incrementBy,
  setCounterValue,
  useCounter,
} from './counter-module'

describe(Counter.name, () => {
  it('displays the value', () => {
    setCounterValue(10)

    const wrapper = shallow(<Counter />)
    const expected = <span>value: 10</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  it('displays the value times two (mocked)', () => {
    useCounter.mockState({ value: 20 })

    const wrapper = shallow(<Counter />)
    const expected = <span>value * 2: 40</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  afterEach(() => {
    useCounter.removeMockState()
  })

  it('displays the value times five (mocked during render)', () => {
    useCounter.mockStateForNextRender({ value: 30 })

    const wrapper = shallow(<Counter />)
    const expected = <span>value * 5: 150</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  it('triggers an increment when the "Increment" button is clicked', () => {
    setCounterValue(10)

    const wrapper = shallow(<Counter />)

    wrapper
      .findWhere(el => el.type() === 'button' && el.text() === 'Increment')
      .simulate('click')

    expect(getCounterValue()).toBe(11)
  })

  it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
    useCounter.mockStateForNextRender({ value: 10 })
    const incrementBySpy = incrementBy.mockOnce(jest.fn())

    const wrapper = shallow(<Counter />)

    wrapper
      .findWhere(el => el.type() === 'button' && el.text() === 'Increment by 5')
      .simulate('click')

    expect(incrementBySpy).toHaveBeenCalledWith(5)
  })
})

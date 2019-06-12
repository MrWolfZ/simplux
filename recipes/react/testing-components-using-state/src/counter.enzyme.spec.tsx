// this code is part of the simplux recipe "testing my React components that read and change state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state

import { mockMutationOnce } from '@simplux/core-testing'
import {
  mockSelectorHookState,
  mockSelectorHookStateForNextRender,
  removeAllSelectorHookMockStates,
  removeSelectorHookMockState,
} from '@simplux/react-testing'
import { shallow } from 'enzyme'
import React from 'react'
import { Counter } from './counter'
import {
  getCounterValue,
  incrementBy,
  setCounterValue,
  useCounter,
} from './counter-module'

// this file shows you how to test your components that read
// and change state; here we are using enzyme but any other
// test renderer would also work

describe(Counter.name, () => {
  // one possible way to test your component that reads state
  // is to test it with the real module by setting the module's
  // state before rendering the component; this is more of an
  // integration style of testing
  it('displays the value', () => {
    setCounterValue(10)

    const wrapper = shallow(<Counter />)
    const expected = <span>value: 10</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  // however, usually it is better to test your component in
  // isolation without interacting with the real module;
  // this is where the react-testing extension comes into play;
  // if you are using the module's selector hook it allows you
  // to mock the state that the hook will use; instead of using
  // the real module's state the hook will call the selector
  // with the provided mock state
  it('displays the value times two (mocked)', () => {
    mockSelectorHookState(useCounter, {
      value: 20,
    })

    const wrapper = shallow(<Counter />)
    const expected = <span>value * 2: 40</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  // the mockSelectorHookState call above mocks the state
  // indefinitely; therefore we need to make sure that we remove
  // the mocked state after each test
  afterEach(() => {
    // we can remove the mock state for a single selector hook
    removeSelectorHookMockState(useCounter)

    // alternatively we can also just remove all selector hook mocks
    removeAllSelectorHookMockStates()
  })

  // for your convenience it is also possible to mock the state
  // just for the next render in which the selector hook is used
  // so that you do not need to actively remove it
  it('displays the value times five (mocked during render)', () => {
    // this will only mock the state for the useCounter hook during
    // the next render; this also works for nested components that
    // use the hook
    mockSelectorHookStateForNextRender(useCounter, { value: 30 })

    const wrapper = shallow(<Counter />)
    const expected = <span>value * 5: 150</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  // testing your components that perform state changes can also be
  // done with the real module by setting the module's state before
  // rendering, then triggering the state change, and finally checking
  // the module's state; this is once again more of an integration
  // style of testing
  it('increments the counter when the "Increment" button is clicked', () => {
    setCounterValue(10)

    const wrapper = shallow(<Counter />)

    wrapper
      .findWhere(el => el.type() === 'button' && el.text() === 'Increment')
      .simulate('click')

    expect(getCounterValue()).toBe(11)
  })

  // however, the recommended way to test these components is to mock the
  // mutation (see the recipe for "testing my code that uses mutations"
  // for more details about this)
  it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
    // it is also a good idea to always mock the module's state
    mockSelectorHookStateForNextRender(useCounter, { value: 10 })
    const incrementBySpy = mockMutationOnce(incrementBy, jest.fn())

    const wrapper = shallow(<Counter />)

    wrapper
      .findWhere(el => el.type() === 'button' && el.text() === 'Increment by 5')
      .simulate('click')

    expect(incrementBySpy).toHaveBeenCalledWith(5)
  })
})

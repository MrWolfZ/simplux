// this code is part of the simplux recipe "testing my React components":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/react/testing-component

import { clearAllSimpluxMocks, mockModuleState, mockMutation } from '@simplux/testing'
import { shallow } from 'enzyme'
import React from 'react'
import { Counter } from './counter'
import { counter } from './counter-module'

// this file shows you how to test your components that read
// and change state; here we are using enzyme but any other
// test renderer would also work

describe(Counter.name, () => {
  // let's start by looking at how we can test components that
  // access a module's state

  // the best way to test our component is to test it in isolation
  // from the module; that means we do not want the real module's
  // state to be accessed during the test; this is where the simplux
  // testing package comes into play; it allows us to mock a
  // module's state
  it('displays the value', () => {
    // all access to the module's state after this call will return
    // the mocked state instead of the real module's state; this
    // includes accesses via the module's selector hook
    mockModuleState(counter, { value: 10 })

    const wrapper = shallow(<Counter />)
    const expected = <span>value: 10</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  // the mockModuleState call above mocks the state indefinitely;
  // therefore we need to make sure that we remove the mocked state
  // after each test
  afterEach(clearAllSimpluxMocks)

  // mocking the state works with any kind of selector, including
  // selectors with arguments
  it('displays the value times five', () => {
    mockModuleState(counter, { value: 20 })

    const wrapper = shallow(<Counter />)
    const expected = <span>value * 5: 100</span>

    expect(wrapper.contains(expected)).toBe(true)
  })

  // testing your components that perform state changes is just as simple;
  // see the recipe for "testing my code that uses mutations" for more
  // details about this
  it('increments the counter when the "Increment" button is clicked', () => {
    // it is a good idea to always mock the module's state for a test
    mockModuleState(counter, { value: 10 })

    const [incrementMock] = mockMutation(counter.increment, jest.fn())

    const wrapper = shallow(<Counter />)

    wrapper.findWhere(el => el.type() === 'button' && el.text() === 'Increment').simulate('click')

    expect(incrementMock).toHaveBeenCalled()
  })

  // of course this works as well for mutations that take arguments
  it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
    mockModuleState(counter, { value: 10 })

    const [incrementByMock] = mockMutation(counter.incrementBy, jest.fn())

    const wrapper = shallow(<Counter />)

    wrapper
      .findWhere(el => el.type() === 'button' && el.text() === 'Increment by 5')
      .simulate('click')

    expect(incrementByMock).toHaveBeenCalledWith(5)
  })
})

// this code is part of the simplux recipe "testing my code that triggers side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-triggering-side-effects

import {
  clearAllSimpluxMocks,
  mockEffect,
  mockMutation,
} from '@simplux/testing'
import { onLoadButtonClicked } from './index'
import { loadTodosFromApi, setTodoItems, Todo } from './todos'

describe('loading todo items', () => {
  // the best way to test our code is to test it in isolation from
  // the module; that means we do not want any mutations or effects
  // to be executed during our test; this is where the **simplux**
  // testing extension comes into play: it allows us to mock
  // mutations and effects
  it('loads data with correct filter', async () => {
    const loadDataMock = jest.fn().mockReturnValue(Promise.resolve([]))

    // after this line all invocations of the effect will be
    // redirected to the provided mock function
    mockEffect(loadTodosFromApi, loadDataMock)

    // we also mock the mutation that is called in our handler;
    // see the recipe for "testing my code that uses mutations"
    // for more details on this
    mockMutation(setTodoItems, jest.fn())

    await onLoadButtonClicked(true)

    expect(loadDataMock).toHaveBeenCalledWith(true)
  })

  // the `mockMutation` and `mockEffect` calls above mock the mutation
  // and effect indefinitely; the testing extension provides a way
  // to clear all simplux mocks which we can simply do after each test
  afterEach(clearAllSimpluxMocks)

  // in specific rare situations it can be useful to manually clear
  // a mock during a test; for this the `mockEffect` function
  // returns a callback function that can be called to clear the mock
  it('sets the loaded items in the module', async () => {
    const data: Todo[] = [
      {
        id: '1',
        description: 'clean',
        isDone: false,
      },
    ]

    const loadDataMock = jest.fn().mockReturnValue(Promise.resolve(data))
    const setTodoItemsMock = jest.fn()

    const clearLoadDataMock = mockEffect(loadTodosFromApi, loadDataMock)
    mockMutation(setTodoItems, setTodoItemsMock)

    await onLoadButtonClicked(true)

    // clear the mock explicitly
    clearLoadDataMock()

    // do something that requires the mock to be cleared

    expect(setTodoItemsMock).toHaveBeenCalledWith(data)
  })
})

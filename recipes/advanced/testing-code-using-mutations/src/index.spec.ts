// this code is part of the simplux recipe "testing my code that uses mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations

import { clearAllSimpluxMocks, mockMutation } from '@simplux/testing'
import { addNewTodoItem } from './index'
import { addTodo, getTodos, setTodos, Todo } from './todos'

describe('adding new todo items', () => {
  // the best way to test our code is to test it in isolation from
  // the module; that means we do not want the mutation to be executed
  // during our test; this is where the **simplux** testing extension
  // comes into play: it allows us to mock a mutation
  it('generates a 4 character ID', () => {
    const addTodoMock = jest.fn()

    // after this line all invocations of the mutation will be
    // redirected to the provided mock function
    mockMutation(addTodo, addTodoMock)

    addNewTodoItem('test item')

    expect(addTodoMock).toHaveBeenCalled()
    expect((addTodoMock.mock.calls[0][0] as Todo).id.length).toBe(4)
  })

  // the mockMutation call above mocks our mutation indefinitely;
  // the testing extension provides a way to clear all simplux mocks
  // which we can simply do after each test
  afterEach(clearAllSimpluxMocks)

  // in specific rare situations it can be useful to manually clear
  // a mock during a test; for this the `mockMutation` function
  // returns a callback function that can be called to clear the mock
  it('uses the value as description', () => {
    const addTodoMock = jest.fn()
    const clearAddTodoMock = mockMutation(addTodo, addTodoMock)

    const description = 'test item (mocked)'
    addNewTodoItem(description)

    expect(addTodoMock).toHaveBeenCalledWith(
      expect.objectContaining({ description }),
    )

    clearAddTodoMock()

    // after clearing the mock all calls will use the original mutation;
    // note that it is usually a bad idea to call the real mutation
    // during a test like this
    const id = addNewTodoItem('test item')
    expect(getTodos()[id].description).toBe('test item')
    setTodos({})
  })
})

// this code is part of the simplux recipe "testing my code that uses mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-code-using-mutations

import {
  mockMutation,
  mockMutationOnce,
  removeAllMutationMocks,
  removeMutationMock,
} from '@simplux/core-testing'
import { addNewTodoItem } from './index'
import { addTodo, getTodos, Todo } from './todos'

describe('adding new todo items', () => {
  // one possible way to test your code that uses mutations
  // is to just let it call the mutation normally and then check
  // the module's state to see if the mutation was correctly
  // applied; this is more of an integration style of testing
  it('uses the value as description', () => {
    const id = addNewTodoItem('test item')
    expect(getTodos()[id].description).toBe('test item')
  })

  // however, usually it is better to test only your code without
  // executing the mutation; this is where the core-testing
  // extension comes into play; it allows us to mock a mutation
  it('generates a 4 character ID', () => {
    const addTodoSpy = mockMutation(addTodo, jest.fn())

    addNewTodoItem('test item')

    expect(addTodoSpy).toHaveBeenCalled()
    expect((addTodoSpy.mock.calls[0][0] as Todo).id.length).toBe(4)
  })

  // if we mock our mutations indefinitely, we need to make sure that
  // we remove them after each test
  afterEach(() => {
    // we can remove the mock for a single mutation
    removeMutationMock(addTodo)

    // alternatively we can also just remove all mocks
    removeAllMutationMocks()
  })

  // for your convenience it is also possible to mock a mutation
  // just once so that you do not need to actively remove it
  it('uses the value as description (mocked once)', () => {
    // this will only mock the addTodo mutation for the next
    // invocation (the mockMutation function also allows specifying
    // a number of times the mutation should be mocked if you need
    // it more than once)
    const addTodoSpy = mockMutationOnce(addTodo, jest.fn())

    const description = 'test item (mocked)'
    addNewTodoItem(description)

    expect(addTodoSpy).toHaveBeenCalledWith(
      expect.objectContaining({ description }),
    )

    // all calls afterwards will use the original mutation
    const id = addNewTodoItem('test item')
    expect(getTodos()[id].description).toBe('test item')
  })
})

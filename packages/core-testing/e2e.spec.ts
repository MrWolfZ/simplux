// this file contains an end-to-end test for the public API

import { createMutations, createSimpluxModule } from '@simplux/core'
import { clearAllSimpluxMocks, mockMutation } from '@simplux/core-testing'

describe(`@simplux/core-testing`, () => {
  interface Todo {
    id: string
    description: string
    isDone: boolean
  }

  interface TodoState {
    todosById: { [id: string]: Todo }
    todoIds: string[]
  }

  const todo1: Todo = { id: '1', description: 'go shopping', isDone: true }
  const todo2: Todo = { id: '2', description: 'clean house', isDone: false }

  const initialState: TodoState = {
    todosById: {},
    todoIds: [],
  }

  const todoStoreWithTodo1: TodoState = {
    todosById: { '1': todo1 },
    todoIds: ['1'],
  }

  const todoStoreWithTodo2: TodoState = {
    todosById: { '2': todo2 },
    todoIds: ['2'],
  }

  const todoStoreWithBothTodos: TodoState = {
    todosById: { '1': todo1, '2': todo2 },
    todoIds: ['1', '2'],
  }

  it('works', () => {
    const todosModule = createSimpluxModule({
      name: 'todos',
      initialState,
    })

    const { addTodo, addTodo2 } = createMutations(todosModule, {
      addTodo({ todosById, todoIds }, todo: Todo) {
        return {
          todosById: {
            ...todosById,
            [todo.id]: todo,
          },
          todoIds: [...todoIds, todo.id],
        }
      },

      addTodo2({ todosById, todoIds }, todo: Todo) {
        return {
          todosById: {
            ...todosById,
            [todo.id]: todo,
          },
          todoIds: [...todoIds, todo.id],
        }
      },
    })

    let addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
    let clearAddTodoMock = mockMutation(addTodo, addTodoSpy)

    let mockedReturnValue = addTodo(todo2)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(mockedReturnValue).toBe(todoStoreWithTodo1)

    clearAddTodoMock()

    addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo2)
    clearAddTodoMock = mockMutation(addTodo, addTodoSpy, 1)

    mockedReturnValue = addTodo(todo1)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(mockedReturnValue).toBe(todoStoreWithTodo2)

    addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
    clearAddTodoMock = mockMutation(addTodo, addTodoSpy)

    const addTodoSpy2 = jest.fn().mockReturnValue(todoStoreWithTodo2)
    mockMutation(addTodo2, addTodoSpy2)

    addTodo(todo2)
    addTodo2(todo1)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(addTodoSpy2).toHaveBeenCalled()

    clearAllSimpluxMocks()

    expect(addTodo(todo1)).toEqual(todoStoreWithTodo1)
    expect(addTodo(todo2)).toEqual(todoStoreWithBothTodos)

    expect(addTodo.withState).toBeDefined()
    expect(addTodo.withState(todoStoreWithTodo1)(todo2)).toEqual(
      todoStoreWithBothTodos,
    )

    expect(addTodo.asActionCreator).toBeDefined()
    expect(addTodo.asActionCreator(todo2).args[0]).toBe(todo2)
  })
})

// this file contains an end-to-end test for the public API

import { createSimpluxModule } from '@simplux/core'
import {
  mockMutation,
  mockMutationOnce,
  removeAllMutationMocks,
  removeMutationMock,
} from '@simplux/core-testing'

describe(`@simplux/selectors`, () => {
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
    const { createMutations } = createSimpluxModule({
      name: 'todos',
      initialState,
    })

    const { addTodo, addTodo2 } = createMutations({
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

    let addTodoSpy = mockMutation(
      addTodo,
      jest.fn().mockReturnValue(todoStoreWithTodo1),
    )

    let mockedReturnValue = addTodo(todo2)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(mockedReturnValue).toBe(todoStoreWithTodo1)

    removeMutationMock(addTodo)

    addTodoSpy = mockMutationOnce(
      addTodo,
      jest.fn().mockReturnValue(todoStoreWithTodo2),
    )

    mockedReturnValue = addTodo(todo1)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(mockedReturnValue).toBe(todoStoreWithTodo2)

    addTodoSpy = mockMutation(
      addTodo,
      jest.fn().mockReturnValue(todoStoreWithTodo1),
    )

    const addTodo2Spy = mockMutation(
      addTodo2,
      jest.fn().mockReturnValue(todoStoreWithTodo2),
    )

    addTodo(todo2)
    addTodo2(todo1)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(addTodo2Spy).toHaveBeenCalled()

    removeAllMutationMocks()

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

// this file contains an end-to-end test for the public API

import { createSimpluxModule } from '@simplux/core'
import '@simplux/core-testing'

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

    const { addTodo } = createMutations({
      addTodo({ todosById, todoIds }, todo: Todo) {
        return {
          todosById: {
            ...todosById,
            [todo.id]: todo,
          },
          todoIds: [...todoIds, todo.id],
        }
      },
    })

    const addTodoSpy = addTodo.mock(
      jest.fn().mockReturnValue(todoStoreWithTodo1),
    )

    const mockedReturnValue = addTodo(todo2)
    expect(addTodoSpy).toHaveBeenCalled()
    expect(mockedReturnValue).toBe(todoStoreWithTodo1)

    addTodo.removeMock()

    expect(addTodo(todo2)).toEqual(todoStoreWithTodo2)

    expect(addTodo.withState).toBeDefined()
    expect(addTodo.withState(todoStoreWithTodo1)(todo2)).toEqual(
      todoStoreWithBothTodos,
    )

    expect(addTodo.asActionCreator).toBeDefined()
    expect(addTodo.asActionCreator(todo2).args[0]).toBe(todo2)
  })
})

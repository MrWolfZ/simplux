// this file contains an end-to-end test for the public API

import { createAsyncTasks } from '@simplux/async'
import { createMutations, createSimpluxModule } from '@simplux/core'

describe(`@simplux/async`, () => {
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

  const todoStoreWithOneTodo: TodoState = {
    todosById: { '1': todo1 },
    todoIds: ['1'],
  }

  const todoStoreWithTwoTodos: TodoState = {
    todosById: { '1': todo1, '2': todo2 },
    todoIds: ['1', '2'],
  }

  it('works', async () => {
    const todosModule = createSimpluxModule({
      name: 'todos',
      initialState: todoStoreWithOneTodo,
    })

    const { addTodo } = createMutations(todosModule, {
      addTodo({ todosById, todoIds }, todo: Todo) {
        todosById[todo.id] = todo
        todoIds.push(todo.id)
      },
    })

    const { addTodoAsync } = createAsyncTasks(todosModule, {
      addTodoAsync: async (todo: Todo) => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return addTodo(todo)
      },
    })

    const updatedState = await addTodoAsync(todo2)

    expect(updatedState).toEqual(todoStoreWithTwoTodos)
  })
})

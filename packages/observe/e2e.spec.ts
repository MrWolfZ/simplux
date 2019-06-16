// this file contains an end-to-end test for the public API

import { createSimpluxModule } from '@simplux/core'
import '@simplux/observe'

describe(`@simplux/observe`, () => {
  interface Todo {
    id: string
    description: string
    isDone: boolean
  }

  interface TodoState {
    todosById: { [id: string]: Todo }
    todoIds: string[]
  }

  const initialTodoState: TodoState = {
    todosById: {},
    todoIds: [],
  }

  const todo1: Todo = { id: '1', description: 'go shopping', isDone: false }
  const todo2: Todo = { id: '2', description: 'clean house', isDone: false }

  const todoStoreWithOneTodo: TodoState = {
    todosById: { '1': todo1 },
    todoIds: ['1'],
  }

  const todoStoreWithTwoTodos: TodoState = {
    todosById: { '1': todo1, '2': todo2 },
    todoIds: ['1', '2'],
  }

  it('works', () => {
    const { observeState, createMutations, setState } = createSimpluxModule({
      name: 'todos',
      initialState: initialTodoState,
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

    const observedStates: TodoState[] = []

    const subscription = observeState().subscribe(value => {
      observedStates.push(value)
    })

    addTodo(todo1)
    setState(todoStoreWithTwoTodos)
    setState(todoStoreWithTwoTodos)

    subscription.unsubscribe()

    setState(todoStoreWithOneTodo)
    addTodo(todo2)

    expect(observedStates).toEqual([
      initialTodoState,
      todoStoreWithOneTodo,
      todoStoreWithTwoTodos,
    ])
  })
})

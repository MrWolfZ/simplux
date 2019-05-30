// this file contains an end-to-end test that verifies mutating reducers can be used

import { createSimpluxModule } from '@simplux/core'
import '@simplux/immer'

describe(`@simplux/immer`, () => {
  interface Todo {
    id: string
    description: string
    isDone: boolean
  }

  interface TodoState {
    todosById: { [id: string]: Todo }
    todoIds: string[]
  }

  const initialTodoState: TodoState = Object.freeze({
    todosById: Object.freeze({}),
    todoIds: (Object.freeze([]) as any) as string[],
  })

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
    const { getState, setState, createMutations } = createSimpluxModule({
      name: 'todos',
      initialState: initialTodoState,
    })

    const { addTodo, addTodos } = createMutations({
      addTodo({ todosById, todoIds }, todo: Todo) {
        todosById[todo.id] = todo
        todoIds.push(todo.id)
      },
      addTodos(state, ...todos: Todo[]) {
        todos.forEach(t => addTodo.withState(state)(t))
      },
    })

    const { removeTodo } = createMutations({
      removeTodo({ todosById, todoIds }, id: string) {
        delete todosById[id]
        todoIds.splice(todoIds.indexOf(id), 1)
      },
    })

    let updatedState = addTodo(todo1)
    expect(updatedState).toEqual(todoStoreWithOneTodo)
    expect(getState()).toEqual(todoStoreWithOneTodo)

    updatedState = removeTodo(todo1.id)
    expect(updatedState).toEqual(initialTodoState)

    setState(todoStoreWithOneTodo)
    expect(getState()).toBe(todoStoreWithOneTodo)

    setState(initialTodoState)
    updatedState = addTodos(todo1, todo2)
    expect(updatedState).toEqual(todoStoreWithTwoTodos)
    expect(getState()).toEqual(todoStoreWithTwoTodos)
  })
})
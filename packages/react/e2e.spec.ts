// this file contains an end-to-end test for the public API

import {
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
import '@simplux/react'
import { act, renderHook } from 'react-hooks-testing-library'
import { createStore } from 'redux'

describe(`@simplux/react`, () => {
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

  it('works', () => {
    const {
      createMutations,
      reactHooks: { useSelector },
    } = createSimpluxModule({
      name: 'todos',
      initialState: todoStoreWithOneTodo,
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

    const { removeTodo } = createMutations({
      removeTodo({ todosById, todoIds }, id: string) {
        const updatedTodosById = { ...todosById }
        delete updatedTodosById[id]
        const updatedTodoIds = todoIds.slice(0)
        updatedTodoIds.splice(updatedTodoIds.indexOf(id), 1)
        return {
          todosById: updatedTodosById,
          todoIds: updatedTodoIds,
        }
      },
    })

    const cleanup = setReduxStoreForSimplux(
      createStore(getSimpluxReducer()),
      s => s,
    )

    // tslint:disable-next-line: no-unnecessary-callback-wrapper
    const { result: state } = renderHook(() => useSelector(s => s))
    const { result: todoIds } = renderHook(() =>
      useSelector(state => state.todoIds),
    )
    const { result: nrOfTodos } = renderHook(() =>
      useSelector(state => Object.keys(state.todosById).length),
    )

    expect(state.current).toBe(todoStoreWithOneTodo)
    expect(todoIds.current).toBe(todoStoreWithOneTodo.todoIds)
    expect(nrOfTodos.current).toBe(1)

    act(() => {
      addTodo(todo2)
    })

    expect(state.current).toEqual(todoStoreWithTwoTodos)
    expect(todoIds.current).toEqual(todoStoreWithTwoTodos.todoIds)
    expect(nrOfTodos.current).toBe(2)

    act(() => {
      removeTodo(todo2.id)
    })

    expect(state.current).toEqual(todoStoreWithOneTodo)
    expect(todoIds.current).toEqual(todoStoreWithOneTodo.todoIds)
    expect(nrOfTodos.current).toBe(1)

    cleanup()
  })
})

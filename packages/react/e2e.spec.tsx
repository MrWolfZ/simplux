// this file contains an end-to-end test for the public API

import {
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
import '@simplux/react'
import React from 'react'
import { act as actHook, renderHook } from 'react-hooks-testing-library'
import { act, render } from 'react-testing-library'
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
      react: {
        hooks: { useSelector },
      },
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

    actHook(() => {
      addTodo(todo2)
    })

    expect(state.current).toEqual(todoStoreWithTwoTodos)
    expect(todoIds.current).toEqual(todoStoreWithTwoTodos.todoIds)
    expect(nrOfTodos.current).toBe(2)

    actHook(() => {
      removeTodo(todo2.id)
    })

    expect(state.current).toEqual(todoStoreWithOneTodo)
    expect(todoIds.current).toEqual(todoStoreWithOneTodo.todoIds)
    expect(nrOfTodos.current).toBe(1)

    cleanup()
  })

  it('uses batching for notifying subscribers', () => {
    const {
      createMutations,
      react: {
        hooks: { useSelector },
      },
    } = createSimpluxModule({
      name: 'batching',
      initialState: 0,
    })

    const { increment } = createMutations({
      increment: c => c + 1,
    })

    const renderedItems: number[] = []

    const Parent = () => {
      const result = useSelector(c => c + 10)
      renderedItems.push(result)
      return <Child />
    }

    const Child = () => {
      const result = useSelector(c => c + 20)
      renderedItems.push(result)
      return <div>{result}</div>
    }

    const cleanup = setReduxStoreForSimplux(
      createStore(getSimpluxReducer()),
      s => s,
    )

    render(<Parent />)

    act(() => {
      increment()
      increment()
    })

    // we intentionally perform the calls below outside of an `act` to
    // simulate a store update outside of the react lifecycle (e.g. due
    // to asynchronous events); since the testing tools log an error when
    // this is done, we simply supress the error by mocking out the error
    // log function
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    increment()
    increment()

    spy.mockRestore()
    cleanup()

    expect(renderedItems).toEqual([10, 20, 12, 22, 13, 23, 14, 24])
  })
})

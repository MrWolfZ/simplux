// this file contains an end-to-end test for the public API

import {
  createSimpluxModule,
  getReduxStore,
  getSimpluxReducer,
  useSimpluxWithExistingStore
} from '@simplux/core'
import { combineReducers, createStore } from 'redux'

describe(`@simplux/core`, () => {
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
    const { getState, setState, createMutations } = createSimpluxModule({
      name: 'todos',
      initialState: initialTodoState,
    })

    const { addTodo, addTodos } = createMutations({
      addTodo({ todosById, todoIds }, todo: Todo) {
        return {
          todosById: {
            ...todosById,
            [todo.id]: todo,
          },
          todoIds: [...todoIds, todo.id],
        }
      },
      addTodos(state, ...todos: Todo[]): TodoState {
        return todos.reduce((s, t) => addTodo.withState(s)(t), state)
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

  it('works with an external store', () => {
    const existingStore = getReduxStore()

    try {
      const customStore = createStore(
        combineReducers({
          otherState: (c: number = 10) => c,
          simplux: getSimpluxReducer(),
        }),
      )

      useSimpluxWithExistingStore(customStore, s => s.simplux)

      const { getState, createMutations } = createSimpluxModule({
        name: 'counter',
        initialState: 10,
      })

      const { increment } = createMutations({
        increment: c => c + 1,
      })

      const updatedState = increment()
      expect(updatedState).toBe(11)
      expect(getState()).toBe(11)
    } finally {
      useSimpluxWithExistingStore(existingStore, s => s)
    }
  })
})

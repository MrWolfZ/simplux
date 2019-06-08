// this file contains an end-to-end test that verifies mutating reducers can be used

import {
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
import '@simplux/immer'
import { createStore } from 'redux'

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

    const cleanup = setReduxStoreForSimplux(
      createStore(getSimpluxReducer()),
      s => s,
    )

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

    cleanup()
  })

  it('does not mutate the state when calling a mutation with a state', () => {
    const initialState = {
      test: 'test',
    }

    const { createMutations } = createSimpluxModule({
      name: 'test',
      initialState,
    })

    const { update } = createMutations({
      update(state, value: string) {
        state.test = value
      },
    })

    const updatedState = update.withState(initialState)('updated')

    expect(updatedState).not.toBe(initialState)
    expect(initialState.test).toBe('test')
  })

  it('does not freeze the state in development mode', () => {
    const { createMutations } = createSimpluxModule({
      name: 'freezeTest',
      initialState: {
        test: 'test',
      },
    })

    const { update } = createMutations({
      update: state => {
        state.test = 'updated'
      },
    })

    const nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    expect(update).not.toThrow()

    process.env.NODE_ENV = nodeEnv
  })
})

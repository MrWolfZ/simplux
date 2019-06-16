// this file contains an end-to-end test for the public API

import {
  createSimpluxModule,
  getSimpluxReducer,
  registerSimpluxModuleExtension,
  setReduxStoreForSimplux,
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
    const {
      getState,
      setState,
      subscribeToStateChanges,
      createMutations,
    } = createSimpluxModule({
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

    const cleanup = setReduxStoreForSimplux(
      createStore(getSimpluxReducer()),
      s => s,
    )

    const handler = jest.fn()
    const unsubscribe = subscribeToStateChanges(handler)
    expect(handler).toHaveBeenCalledWith(initialTodoState)

    let updatedState = addTodo(todo1)
    expect(updatedState).toEqual(todoStoreWithOneTodo)
    expect(getState()).toEqual(todoStoreWithOneTodo)
    expect(handler).toHaveBeenCalledWith(updatedState)

    updatedState = removeTodo(todo1.id)
    expect(updatedState).toEqual(initialTodoState)
    expect(handler).toHaveBeenCalledWith(updatedState)

    setState(todoStoreWithOneTodo)
    expect(getState()).toBe(todoStoreWithOneTodo)
    expect(handler).toHaveBeenCalledWith(todoStoreWithOneTodo)

    setState(initialTodoState)
    updatedState = addTodos(todo1, todo2)
    expect(updatedState).toEqual(todoStoreWithTwoTodos)
    expect(getState()).toEqual(todoStoreWithTwoTodos)
    expect(handler).toHaveBeenCalledWith(updatedState)

    expect(handler).toHaveBeenCalledTimes(6)

    unsubscribe()
    cleanup()
  })

  it('works without setting a redux store', () => {
    const { createMutations } = createSimpluxModule({
      name: 'test',
      initialState: 0,
    })

    const { increment } = createMutations({
      increment: c => c + 1,
    })

    expect(increment()).toBe(1)
  })

  it('sets initial module states when switching to a new store', () => {
    const initialState = { prop: 'value' }

    const { setState } = createSimpluxModule({
      name: 'switchToNewStore',
      initialState,
    })

    setState({ prop: 'updated' })

    const store = createStore(
      combineReducers({
        simplux: getSimpluxReducer(),
      }),
    )

    const cleanup = setReduxStoreForSimplux(store, (s: any) => s.simplux)

    expect(store.getState().simplux.switchToNewStore).toBe(initialState)

    cleanup()
  })

  it('sets initial module states when created after switching to a new store', () => {
    const store = createStore(
      combineReducers({
        simplux: getSimpluxReducer(),
      }),
    )

    const cleanup = setReduxStoreForSimplux(store, (s: any) => s.simplux)

    const initialState = { prop: 'value' }

    createSimpluxModule({
      name: 'switchToNewStoreAfter',
      initialState,
    })

    expect(store.getState().simplux.switchToNewStoreAfter).toBe(initialState)

    cleanup()
  })

  it('allows registering a module extension', () => {
    const unregister = registerSimpluxModuleExtension(() => ({
      testExtension: {},
    }))

    const module = createSimpluxModule({
      name: 'test',
      initialState: 0,
    })

    expect((module as any).testExtension).toBeDefined()

    unregister()
  })

  it('freezes the state in development mode', () => {
    const { createMutations } = createSimpluxModule({
      name: 'freezeTest',
      initialState: {
        test: 'test',
      },
    })

    const { update } = createMutations({
      update: state => {
        state.test = 'updated'
        return state
      },
    })

    const nodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    expect(update).toThrowError(/Cannot assign to read only property/)

    process.env.NODE_ENV = nodeEnv
  })
})

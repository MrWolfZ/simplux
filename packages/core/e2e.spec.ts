// this file contains an end-to-end test for the public API

import {
  createEffect,
  createEffects,
  createMutations,
  createSelectors,
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
  _isSimpluxModule,
} from '@simplux/core'
import { combineReducers, createStore } from 'redux'

describe(`@simplux/core`, () => {
  interface Todo {
    readonly id: string
    readonly description: string
    readonly isDone: boolean
  }

  interface TodoState {
    todosById: { [id: string]: Todo }
    todoIds: string[]
  }

  const initialTodoState: TodoState = {
    todosById: {},
    todoIds: [],
  }

  const todo1: Todo = { id: '1', description: 'go shopping', isDone: true }
  const todo2: Todo = { id: '2', description: 'clean house', isDone: false }

  const todoStoreWithOneTodo: TodoState = {
    todosById: { 1: todo1 },
    todoIds: ['1'],
  }

  const todoStoreWithTwoTodos: TodoState = {
    todosById: { 1: todo1, 2: todo2 },
    todoIds: ['1', '2'],
  }

  it('works', () => {
    const todosModule = createSimpluxModule({
      name: 'todos',
      initialState: initialTodoState,
    })

    const { state, setState, subscribeToStateChanges } = todosModule

    const { addTodo, addTodos } = createMutations(todosModule, {
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
        return todos.reduce((s, t) => addTodo.withState(s, t), state)
      },
    })

    const { removeTodo } = createMutations(todosModule, {
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
      (s) => s,
    )

    const handler = jest.fn()
    const subscription = subscribeToStateChanges(handler)
    expect(handler).toHaveBeenCalledWith(initialTodoState, initialTodoState)

    let updatedState = addTodo(todo1)
    expect(updatedState).toEqual(todoStoreWithOneTodo)
    expect(state()).toEqual(todoStoreWithOneTodo)
    expect(handler).toHaveBeenCalledWith(updatedState, initialTodoState)

    let previousState = updatedState
    updatedState = removeTodo(todo1.id)
    expect(updatedState).toEqual(initialTodoState)
    expect(handler).toHaveBeenCalledWith(updatedState, previousState)

    previousState = updatedState
    setState(todoStoreWithOneTodo)
    expect(state()).toBe(todoStoreWithOneTodo)
    expect(handler).toHaveBeenCalledWith(todoStoreWithOneTodo, previousState)

    setState(initialTodoState)
    updatedState = addTodos(todo1, todo2)
    expect(updatedState).toEqual(todoStoreWithTwoTodos)
    expect(state()).toEqual(todoStoreWithTwoTodos)
    expect(handler).toHaveBeenCalledWith(updatedState, initialTodoState)

    expect(handler).toHaveBeenCalledTimes(6)

    expect(_isSimpluxModule(todosModule)).toBe(true)
    expect(_isSimpluxModule('string')).toBe(false)

    subscription.unsubscribe()
    cleanup()
  })

  it('works with module factory shorthand', () => {
    const counterModule = createSimpluxModule('counter', 10)
    expect(counterModule.state()).toBe(10)
  })

  describe('mutable/immer-style mutation', () => {
    it('works', () => {
      const todosModule = createSimpluxModule({
        name: 'mutableTodosModule1',
        initialState: initialTodoState,
      })

      const { state, setState, subscribeToStateChanges } = todosModule

      const { addTodo, addTodos } = createMutations(todosModule, {
        addTodo({ todosById, todoIds }, todo: Todo) {
          todosById[todo.id] = todo
          todoIds.push(todo.id)
        },
        addTodos(state, ...todos: Todo[]) {
          todos.forEach((t) => addTodo.withState(state, t))
        },
      })

      const { removeTodo } = createMutations(todosModule, {
        removeTodo({ todosById, todoIds }, id: string) {
          delete todosById[id]
          todoIds.splice(todoIds.indexOf(id), 1)
        },
      })

      const cleanup = setReduxStoreForSimplux(
        createStore(getSimpluxReducer()),
        (s) => s,
      )

      const handler = jest.fn()
      const subscription = subscribeToStateChanges(handler)
      expect(handler).toHaveBeenCalledWith(initialTodoState, initialTodoState)

      let updatedState = addTodo(todo1)
      expect(updatedState).toEqual(todoStoreWithOneTodo)
      expect(state()).toEqual(todoStoreWithOneTodo)
      expect(handler).toHaveBeenCalledWith(updatedState, initialTodoState)

      let previousState = updatedState
      updatedState = removeTodo(todo1.id)
      expect(updatedState).toEqual(initialTodoState)
      expect(handler).toHaveBeenCalledWith(updatedState, previousState)

      previousState = updatedState
      setState(todoStoreWithOneTodo)
      expect(state()).toBe(todoStoreWithOneTodo)
      expect(handler).toHaveBeenCalledWith(todoStoreWithOneTodo, previousState)

      setState(initialTodoState)
      updatedState = addTodos(todo1, todo2)
      expect(updatedState).toEqual(todoStoreWithTwoTodos)
      expect(state()).toEqual(todoStoreWithTwoTodos)
      expect(handler).toHaveBeenCalledWith(updatedState, initialTodoState)

      expect(handler).toHaveBeenCalledTimes(6)

      subscription.unsubscribe()
      cleanup()
    })

    it('does not mutate the state when calling a mutation', () => {
      const initialState = {
        test: 'test',
      }

      const testModule = createSimpluxModule({
        name: 'mutableImmerModule1',
        initialState,
      })

      const { update } = createMutations(testModule, {
        update(state, value: string) {
          state.test = value
        },
      })

      const updatedState = update('updated')

      expect(updatedState).not.toBe(initialState)
      expect(initialState.test).toBe('test')
    })

    it('does not mutate the state when calling a mutation with a state', () => {
      const initialState = {
        test: 'test',
      }

      const testModule = createSimpluxModule({
        name: 'mutableImmerModule2',
        initialState,
      })

      const { update } = createMutations(testModule, {
        update(state, value: string) {
          state.test = value
        },
      })

      const updatedState = update.withState(initialState, 'updated')

      expect(updatedState).not.toBe(initialState)
      expect(initialState.test).toBe('test')
    })
  })

  it('works without setting a redux store', () => {
    const testModule = createSimpluxModule({
      name: 'worksWithoutReduxStore',
      initialState: 0,
    })

    const { increment } = createMutations(testModule, {
      increment: (c) => c + 1,
    })

    expect(increment()).toBe(1)
  })

  it('sets initial module states when switching to a new store', () => {
    const initialState = { prop: 'value' }

    createSimpluxModule({
      name: 'switchToNewStore',
      initialState,
    })

    const store = createStore(
      combineReducers({
        simplux: getSimpluxReducer(),
      }),
    )

    const cleanup = setReduxStoreForSimplux(store, (s: any) => s.simplux)

    expect(store.getState().simplux.switchToNewStore).toBe(initialState)

    cleanup()
  })

  it('persists state from previous store if switching to new store before end of first microtask queue', () => {
    const initialState = { prop: 'value' }
    const updatedState = { prop: 'value' }

    const { setState } = createSimpluxModule({
      name: 'switchToNewStore',
      initialState,
    })

    setState(updatedState)

    const store = createStore(
      combineReducers({
        simplux: getSimpluxReducer(),
      }),
    )

    const cleanup = setReduxStoreForSimplux(store, (s: any) => s.simplux)

    expect(store.getState().simplux.switchToNewStore).toEqual(updatedState)

    cleanup()
  })

  it('does not persists state from previous store if switching to new store after end of first microtask queue', async () => {
    const initialState = { prop: 'value' }
    const updatedState = { prop: 'value' }

    const { setState } = createSimpluxModule({
      name: 'switchToNewStore',
      initialState,
    })

    setState(updatedState)

    const store = createStore(
      combineReducers({
        simplux: getSimpluxReducer(),
      }),
    )

    await Promise.resolve()

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

  describe('selector', () => {
    it('works', () => {
      const todosModule = createSimpluxModule({
        name: 'selectors',
        initialState: todoStoreWithTwoTodos,
      })

      const { nrOfTodos, getTodosWithDoneState } = createSelectors(
        todosModule,
        {
          nrOfTodos: ({ todoIds }) => todoIds.length,
          getTodosWithDoneState({ todoIds, todosById }, isDone: boolean) {
            return todoIds
              .map((id) => todosById[id]!)
              .filter((t) => t.isDone === isDone)
          },
        },
      )

      const { nrOfTodosTimes2 } = createSelectors(todosModule, {
        nrOfTodosTimes2: (s) => nrOfTodos.withState(s) * 2,
      })

      expect(nrOfTodos()).toBe(2)
      expect(nrOfTodosTimes2()).toBe(4)
      expect(getTodosWithDoneState(true)).toEqual([todo1])

      expect(nrOfTodos.withState(todoStoreWithOneTodo)).toBe(1)

      const cleanup = setReduxStoreForSimplux(
        createStore(getSimpluxReducer()),
        (s) => s,
      )

      expect(nrOfTodos()).toBe(2)

      cleanup()
    })
  })

  describe('effect', () => {
    it('works', async () => {
      const todosModule = createSimpluxModule({
        name: 'effects',
        initialState: initialTodoState,
      })

      const { addTodo } = createMutations(todosModule, {
        addTodo({ todosById, todoIds }, todo: Todo) {
          todosById[todo.id] = todo
          todoIds.push(todo.id)
        },
      })

      const addTodoEffect = createEffect(async () => {
        await new Promise<void>((resolve) => resolve())
        addTodo(todo1)
      })

      await addTodoEffect()

      expect(todosModule.state()).toEqual(todoStoreWithOneTodo)

      todosModule.setState(initialTodoState)

      const { addTodoEffect1, addTodoEffect2 } = createEffects({
        addTodoEffect1: async () => {
          await new Promise<void>((resolve) => resolve())
          addTodo(todo1)
        },
        addTodoEffect2: async () => {
          await new Promise<void>((resolve) => resolve())
          addTodo(todo2)
        },
      })

      await addTodoEffect1()
      await addTodoEffect2()

      expect(todosModule.state()).toEqual(todoStoreWithTwoTodos)
    })
  })
})

// this file contains an end-to-end test for the public API

import {
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'
import { createSelectorHook } from '@simplux/react'
import { clearAllSimpluxMocks, mockModuleState } from '@simplux/testing'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import React from 'react'
import { act as actHook, renderHook } from 'react-hooks-testing-library'

describe(`@simplux/react`, () => {
  afterEach(cleanup)
  afterEach(clearAllSimpluxMocks)

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

  describe('selector hook', () => {
    const todosModule = createSimpluxModule({
      name: 'todos',
      initialState: todoStoreWithOneTodo,
    })

    const { addTodo } = createMutations(todosModule, {
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

    let unmounts: (() => void)[] = []

    beforeEach(() => {
      unmounts = []
      todosModule.setState(todoStoreWithOneTodo)
    })

    afterEach(() => {
      unmounts.forEach(f => f())
    })

    it('renders initially with the module state', () => {
      const useSelector = createSelectorHook(todosModule)

      const { result: state, unmount: unmount1 } = renderHook(() =>
        useSelector(s => s),
      )
      const { result: todoIds, unmount: unmount2 } = renderHook(() =>
        useSelector(state => state.todoIds),
      )
      const { result: nrOfTodos, unmount: unmount3 } = renderHook(() =>
        useSelector(state => Object.keys(state.todosById).length),
      )

      unmounts.push(unmount1, unmount2, unmount3)

      expect(state.current).toBe(todoStoreWithOneTodo)
      expect(todoIds.current).toBe(todoStoreWithOneTodo.todoIds)
      expect(nrOfTodos.current).toBe(1)
    })

    it('re-renders when the state changes', () => {
      const useSelector = createSelectorHook(todosModule)

      const { result: state, unmount: unmount1 } = renderHook(() =>
        useSelector(s => s),
      )
      const { result: todoIds, unmount: unmount2 } = renderHook(() =>
        useSelector(state => state.todoIds),
      )
      const { result: nrOfTodos, unmount: unmount3 } = renderHook(() =>
        useSelector(state => Object.keys(state.todosById).length),
      )

      unmounts.push(unmount1, unmount2, unmount3)

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
    })

    it('renders initially with the mocked module state if set', () => {
      const useSelector = createSelectorHook(todosModule)

      mockModuleState(todosModule, todoStoreWithTwoTodos)

      const { result: state, unmount: unmount1 } = renderHook(() =>
        useSelector(s => s),
      )
      const { result: todoIds, unmount: unmount2 } = renderHook(() =>
        useSelector(state => state.todoIds),
      )
      const { result: nrOfTodos, unmount: unmount3 } = renderHook(() =>
        useSelector(state => Object.keys(state.todosById).length),
      )

      unmounts.push(unmount1, unmount2, unmount3)

      expect(state.current).toBe(todoStoreWithTwoTodos)
      expect(todoIds.current).toBe(todoStoreWithTwoTodos.todoIds)
      expect(nrOfTodos.current).toBe(2)
    })

    it('uses batching for notifying subscribers', () => {
      const batchingModule = createSimpluxModule({
        name: 'batching',
        initialState: 0,
      })

      const useSelector = createSelectorHook(batchingModule)

      const { increment } = createMutations(batchingModule, {
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

      expect(renderedItems).toEqual([10, 20, 12, 22, 13, 23, 14, 24])
    })

    it('works with simplux selectors', () => {
      const useSelector = createSelectorHook(todosModule)

      const { getIds, getById } = createSelectors(todosModule, {
        getIds: state => state.todoIds,
        getById: (state, id: string) => state.todosById[id],
      })

      const { result: todoIds, unmount: unmount1 } = renderHook(() =>
        useSelector(getIds.withState),
      )

      const { result: todo, unmount: unmount2 } = renderHook(() =>
        useSelector(s => getById.withState(s, '1')),
      )

      unmounts.push(unmount1, unmount2)

      expect(todoIds.current).toBe(todoStoreWithOneTodo.todoIds)
      expect(todo.current).toBe(todo1)
    })
  })

  describe('mutations', () => {
    it('ignore event arg', () => {
      const ignoreEventArgModule = createSimpluxModule({
        name: 'ignoreEventArg',
        initialState: 0,
      })

      const incrementSpy = jest.fn()

      const { increment } = createMutations(ignoreEventArgModule, {
        increment: incrementSpy,
      })

      const Comp = () => {
        return (
          <div>
            <button id='btn' onClick={increment} />
          </div>
        )
      }

      const { container } = render(<Comp />)

      const button = container.querySelector('#btn')!

      act(() => {
        fireEvent.click(button)
      })

      expect(incrementSpy).toHaveBeenCalledWith(0)
    })
  })
})

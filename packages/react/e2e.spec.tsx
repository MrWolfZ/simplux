// this file contains an end-to-end test for the public API

import {
  createMutations,
  createSelectors,
  createSimpluxModule,
} from '@simplux/core'
import { SimpluxProvider, useSimplux } from '@simplux/react'
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

  describe('useSimplux', () => {
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

    const { getTodos, getTodoIds, getNrOfTodos, getById } = createSelectors(
      todosModule,
      {
        getTodos: s => s,
        getTodoIds: s => s.todoIds,
        getNrOfTodos: s => Object.keys(s.todosById).length,
        getById: (state, id: string) => state.todosById[id],
      },
    )

    let unmounts: (() => void)[] = []

    beforeEach(() => {
      unmounts = []
      todosModule.setState(todoStoreWithOneTodo)
    })

    afterEach(() => {
      unmounts.forEach(f => f())
    })

    it('renders initially with the module state', () => {
      const { result: state, unmount: unmount1 } = renderHook(() =>
        useSimplux(getTodos),
      )
      const { result: todoIds, unmount: unmount2 } = renderHook(() =>
        useSimplux(getTodoIds),
      )
      const { result: nrOfTodos, unmount: unmount3 } = renderHook(() =>
        useSimplux(getNrOfTodos),
      )
      const { result: todoResult, unmount: unmount4 } = renderHook(() =>
        useSimplux(getById, '1'),
      )

      unmounts.push(unmount1, unmount2, unmount3, unmount4)

      expect(state.current).toBe(todoStoreWithOneTodo)
      expect(todoIds.current).toBe(todoStoreWithOneTodo.todoIds)
      expect(nrOfTodos.current).toBe(1)
      expect(todoResult.current).toBe(todo1)
    })

    it('re-renders when the state changes', () => {
      const { result: state, unmount: unmount1 } = renderHook(() =>
        useSimplux(getTodos),
      )
      const { result: todoIds, unmount: unmount2 } = renderHook(() =>
        useSimplux(getTodoIds),
      )
      const { result: nrOfTodos, unmount: unmount3 } = renderHook(() =>
        useSimplux(getNrOfTodos),
      )
      const { result: todoResult, unmount: unmount4 } = renderHook(() =>
        useSimplux(getById, '1'),
      )

      unmounts.push(unmount1, unmount2, unmount3, unmount4)

      actHook(() => {
        addTodo(todo2)
      })

      expect(state.current).toEqual(todoStoreWithTwoTodos)
      expect(todoIds.current).toEqual(todoStoreWithTwoTodos.todoIds)
      expect(nrOfTodos.current).toBe(2)
      expect(todoResult.current).toBe(todo1)

      actHook(() => {
        removeTodo(todo2.id)
      })

      expect(state.current).toEqual(todoStoreWithOneTodo)
      expect(todoIds.current).toEqual(todoStoreWithOneTodo.todoIds)
      expect(nrOfTodos.current).toBe(1)
      expect(todoResult.current).toBe(todo1)
    })

    it('renders initially with the mocked module state if set', () => {
      mockModuleState(todosModule, todoStoreWithTwoTodos)

      const { result: state, unmount: unmount1 } = renderHook(() =>
        useSimplux(getTodos),
      )
      const { result: todoIds, unmount: unmount2 } = renderHook(() =>
        useSimplux(getTodoIds),
      )
      const { result: nrOfTodos, unmount: unmount3 } = renderHook(() =>
        useSimplux(getNrOfTodos),
      )
      const { result: todoResult, unmount: unmount4 } = renderHook(() =>
        useSimplux(getById, '2'),
      )

      unmounts.push(unmount1, unmount2, unmount3, unmount4)

      expect(state.current).toBe(todoStoreWithTwoTodos)
      expect(todoIds.current).toBe(todoStoreWithTwoTodos.todoIds)
      expect(nrOfTodos.current).toBe(2)
      expect(todoResult.current).toBe(todo2)
    })

    it('renders initially with the module state with Provider', () => {
      const renderedItems: any[] = []

      const Comp = () => {
        const state = useSimplux(getTodos)
        const todoIds = useSimplux(getTodoIds)
        const nrOfTodos = useSimplux(getNrOfTodos)
        const todoResult = useSimplux(getById, '1')
        renderedItems.push(state, todoIds, nrOfTodos, todoResult)
        return <div>{nrOfTodos}</div>
      }

      render(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([
        todoStoreWithOneTodo,
        todoStoreWithOneTodo.todoIds,
        1,
        todo1,
      ])
    })

    it('re-renders when the state changes with Provider', () => {
      const renderedItems: any[] = []

      const Comp = () => {
        const state = useSimplux(getTodos)
        const todoIds = useSimplux(getTodoIds)
        const nrOfTodos = useSimplux(getNrOfTodos)
        const todoResult = useSimplux(getById, '1')
        renderedItems.push(state, todoIds, nrOfTodos, todoResult)
        return <div>{nrOfTodos}</div>
      }

      render(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([
        todoStoreWithOneTodo,
        todoStoreWithOneTodo.todoIds,
        1,
        todo1,
      ])

      addTodo(todo2)

      expect(renderedItems).toEqual([
        todoStoreWithOneTodo,
        todoStoreWithOneTodo.todoIds,
        1,
        todo1,
        todoStoreWithTwoTodos,
        todoStoreWithTwoTodos.todoIds,
        2,
        todo1,
      ])

      removeTodo(todo2.id)

      expect(renderedItems).toEqual([
        todoStoreWithOneTodo,
        todoStoreWithOneTodo.todoIds,
        1,
        todo1,
        todoStoreWithTwoTodos,
        todoStoreWithTwoTodos.todoIds,
        2,
        todo1,
        todoStoreWithOneTodo,
        todoStoreWithOneTodo.todoIds,
        1,
        todo1,
      ])
    })

    it('renders initially with a mocked module state with Provider', () => {
      mockModuleState(todosModule, todoStoreWithTwoTodos)

      const renderedItems: any[] = []

      const Comp = () => {
        const state = useSimplux(getTodos)
        const todoIds = useSimplux(getTodoIds)
        const nrOfTodos = useSimplux(getNrOfTodos)
        const todoResult = useSimplux(getById, '2')
        renderedItems.push(state, todoIds, nrOfTodos, todoResult)
        return <div>{nrOfTodos}</div>
      }

      render(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Comp />
        </SimpluxProvider>,
      )

      expect(renderedItems).toEqual([
        todoStoreWithTwoTodos,
        todoStoreWithTwoTodos.todoIds,
        2,
        todo2,
      ])
    })

    it('uses batching for notifying subscribers with Provider', () => {
      const batchingModule = createSimpluxModule({
        name: 'batching',
        initialState: 0,
      })

      const { increment } = createMutations(batchingModule, {
        increment: c => c + 1,
      })

      const { plus10, plus20 } = createSelectors(batchingModule, {
        plus10: c => c + 10,
        plus20: c => c + 20,
      })

      const renderedItems: number[] = []

      const Parent = () => {
        const result = useSimplux(plus10)
        renderedItems.push(result)
        return <Child />
      }

      const Child = () => {
        const result = useSimplux(plus20)
        renderedItems.push(result)
        return <div>{result}</div>
      }

      render(
        // tslint:disable-next-line: jsx-wrap-multiline
        <SimpluxProvider>
          <Parent />
        </SimpluxProvider>,
      )

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

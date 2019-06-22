// this file contains an end-to-end test for the public API

import { createMutations, createSimpluxModule } from '@simplux/core'
import { clearAllSimpluxMocks, mockMutation } from '@simplux/core-testing'

describe(`@simplux/core-testing`, () => {
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

  const initialState: TodoState = {
    todosById: {},
    todoIds: [],
  }

  const todoStoreWithTodo1: TodoState = {
    todosById: { '1': todo1 },
    todoIds: ['1'],
  }

  const todoStoreWithTodo2: TodoState = {
    todosById: { '2': todo2 },
    todoIds: ['2'],
  }

  const todoStoreWithBothTodos: TodoState = {
    todosById: { '1': todo1, '2': todo2 },
    todoIds: ['1', '2'],
  }

  afterEach(clearAllSimpluxMocks)


  describe('mutations', () => {
    const mutationMockTestModule = createSimpluxModule({
      name: 'mutationMockTest1',
      initialState,
    })

    const { addTodo, addTodo2 } = createMutations(mutationMockTestModule, {
      addTodo({ todosById, todoIds }, todo: Todo) {
        return {
          todosById: {
            ...todosById,
            [todo.id]: todo,
          },
          todoIds: [...todoIds, todo.id],
        }
      },

      addTodo2({ todosById, todoIds }, todo: Todo) {
        return {
          todosById: {
            ...todosById,
            [todo.id]: todo,
          },
          todoIds: [...todoIds, todo.id],
        }
      },
    })

    beforeEach(() => {
      mutationMockTestModule.setState(initialState)
    })

    it('can be mocked', () => {
      const addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
      mockMutation(addTodo, addTodoSpy)

      const addTodoSpy2 = jest.fn().mockReturnValue(todoStoreWithTodo2)
      mockMutation(addTodo2, addTodoSpy2)

      const mockedReturnValue = addTodo(todo2)
      const mockedReturnValue2 = addTodo2(todo1)

      expect(addTodoSpy).toHaveBeenCalledWith(todo2)
      expect(mockedReturnValue).toBe(todoStoreWithTodo1)

      expect(addTodoSpy2).toHaveBeenCalledWith(todo1)
      expect(mockedReturnValue2).toBe(todoStoreWithTodo2)
    })

    it('extras can be called as normal when state is mocked', () => {
      const addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
      mockMutation(addTodo, addTodoSpy)

      expect(addTodo.withState).toBeDefined()
      expect(addTodo.withState(todoStoreWithTodo1)(todo2)).toEqual(
        todoStoreWithBothTodos,
      )

      expect(addTodo.asActionCreator).toBeDefined()
      expect(addTodo.asActionCreator(todo2).args[0]).toBe(todo2)
    })

    describe('mocks', () => {
      it('can be cleared', () => {
        const addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
        const clear = mockMutation(addTodo, addTodoSpy)

        addTodo(todo2)

        clear()

        const updatedState = addTodo(todo1)

        expect(addTodoSpy).toHaveBeenCalledWith(todo2)
        expect(updatedState).toEqual(todoStoreWithTodo1)
      })

      it('can be removed all at once', () => {
        const addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
        mockMutation(addTodo, addTodoSpy)

        const addTodoSpy2 = jest.fn().mockReturnValue(todoStoreWithTodo2)
        mockMutation(addTodo2, addTodoSpy2)

        addTodo(todo2)
        addTodo2(todo1)

        clearAllSimpluxMocks()

        const updatedState1 = addTodo(todo1)
        const updatedState2 = addTodo2(todo2)

        expect(addTodoSpy).toHaveBeenCalledWith(todo2)
        expect(updatedState1).toEqual(todoStoreWithTodo1)

        expect(addTodoSpy2).toHaveBeenCalledWith(todo1)
        expect(updatedState2).toEqual(todoStoreWithBothTodos)
      })

      it('can be removed all at once for multiple modules', () => {
        const mutationMockTestModule2 = createSimpluxModule({
          name: 'mutationMockTest2',
          initialState,
        })

        const { addTodo3 } = createMutations(mutationMockTestModule2, {
          addTodo3({ todosById, todoIds }, todo: Todo) {
            return {
              todosById: {
                ...todosById,
                [todo.id]: todo,
              },
              todoIds: [...todoIds, todo.id],
            }
          },
        })

        const addTodoSpy = jest.fn().mockReturnValue(todoStoreWithTodo1)
        mockMutation(addTodo, addTodoSpy)

        const addTodoSpy3 = jest.fn().mockReturnValue(todoStoreWithTodo2)
        mockMutation(addTodo3, addTodoSpy3)

        addTodo(todo2)
        addTodo3(todo1)

        clearAllSimpluxMocks()

        const updatedState1 = addTodo(todo1)
        const updatedState3 = addTodo3(todo2)

        expect(addTodoSpy).toHaveBeenCalledWith(todo2)
        expect(updatedState1).toEqual(todoStoreWithTodo1)

        expect(addTodoSpy3).toHaveBeenCalledWith(todo1)
        expect(updatedState3).toEqual(todoStoreWithTodo2)
      })
    })
  })
})

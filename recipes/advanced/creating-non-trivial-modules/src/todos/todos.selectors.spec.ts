// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import {
  todo1,
  todo2,
  todoStateWithTwoPendingAndOneDoneTodo,
  todoStateWithTwoTodos,
} from './todos.module.spec'
import {
  selectAllTodos,
  selectNumberOfTodos,
  selectPendingTodos,
  selectTodoById,
  selectTodoIds,
} from './todos.selectors'

describe('todos module', () => {
  describe('selectors', () => {
    describe('selectTodoIds', () => {
      it('returns the array of IDs', () => {
        const ids = selectTodoIds(todoStateWithTwoTodos)
        expect(ids).toEqual(['1', '2'])
      })
    })

    describe('selectNumberOfTodos', () => {
      it('returns the number of items', () => {
        const numberOfTodos = selectNumberOfTodos(todoStateWithTwoTodos)
        expect(numberOfTodos).toBe(2)
      })
    })

    describe('selectAllTodos', () => {
      it('returns an array of all items', () => {
        const todos = selectAllTodos(todoStateWithTwoTodos)
        expect(todos).toEqual([todo1, todo2])
      })
    })

    describe('selectPendingTodos', () => {
      it('returns an array of all items that are not done', () => {
        const todos = selectPendingTodos(todoStateWithTwoPendingAndOneDoneTodo)
        expect(todos).toEqual([todo1, todo2])
      })
    })

    describe('selectTodoById', () => {
      it('returns an item by ID', () => {
        const selectedTodo = selectTodoById(
          todoStateWithTwoPendingAndOneDoneTodo,
          todo2.id,
        )

        expect(selectedTodo).toEqual(todo2)
      })

      it('returns undefined if the item does not exist', () => {
        const selectedTodo = selectTodoById(
          todoStateWithTwoPendingAndOneDoneTodo,
          'does-not-exist',
        )

        expect(selectedTodo).toBeUndefined()
      })
    })
  })
})

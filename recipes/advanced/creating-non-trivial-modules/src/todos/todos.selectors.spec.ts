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
      const ids = selectTodoIds(todoStateWithTwoTodos)
      expect(ids).toEqual(['1', '2'])
    })

    describe('selectNumberOfTodos', () => {
      const numberOfTodos = selectNumberOfTodos(todoStateWithTwoTodos)
      expect(numberOfTodos).toBe(2)
    })

    describe('selectAllTodos', () => {
      const todos = selectAllTodos(todoStateWithTwoTodos)
      expect(todos).toEqual([todo1, todo2])
    })

    describe('selectPendingTodos', () => {
      const todos = selectPendingTodos(todoStateWithTwoPendingAndOneDoneTodo)
      expect(todos).toEqual([todo1, todo2])
    })

    describe('selectTodoById', () => {
      const selectedTodo = selectTodoById(
        todoStateWithTwoPendingAndOneDoneTodo,
        todo2.id,
      )
      expect(selectedTodo).toEqual(todo2)
    })
  })
})

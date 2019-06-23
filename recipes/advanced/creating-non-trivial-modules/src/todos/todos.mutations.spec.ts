// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import {
  emptyTodoState,
  todo1,
  todo2,
  todoStateWithOneTodo,
  todoStateWithTwoTodos,
} from './todos.module.spec'
import {
  addTodo,
  addTodos,
  markTodoAsDone,
  removeTodoById,
} from './todos.mutations'

describe('todos module', () => {
  describe('mutations', () => {
    describe('addTodo', () => {
      it('adds a single Todo', () => {
        const updatedState = addTodo.withState(emptyTodoState)(todo1)
        expect(updatedState).toEqual(todoStateWithOneTodo)
      })
    })

    describe('addTodos', () => {
      const addTodosEmpty = addTodos.withState(emptyTodoState)

      it('adds a single Todo', () => {
        const updatedState = addTodosEmpty(todo1)
        expect(updatedState).toEqual(todoStateWithOneTodo)
      })

      it('adds multiple Todos', () => {
        const updatedState = addTodosEmpty(todo1, todo2)
        expect(updatedState).toEqual(todoStateWithTwoTodos)
      })
    })

    describe('removeTodoById', () => {
      const removeByIdWithTwo = removeTodoById.withState(todoStateWithTwoTodos)

      it('removes a Todo by id', () => {
        const updatedState = removeByIdWithTwo(todo2.id)
        expect(updatedState).toEqual(todoStateWithOneTodo)
      })

      it('does not change the state if the todo does not exist', () => {
        const updatedState = removeByIdWithTwo('does-not-exist')
        expect(updatedState).toBe(todoStateWithTwoTodos)
      })
    })

    describe('markTodoAsDone', () => {
      const markAsDoneWithTwo = markTodoAsDone.withState(todoStateWithTwoTodos)

      it('marks a Todo as done', () => {
        const updatedState = markAsDoneWithTwo(todo2.id)
        expect(updatedState.todosById[todo2.id].isDone).toEqual(true)
      })

      it('does not change the state if the todo does not exist', () => {
        const updatedState = markAsDoneWithTwo('does-not-exist')
        expect(updatedState).toBe(todoStateWithTwoTodos)
      })
    })
  })
})

// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { getTodosState, Todo, TodoState } from './todos.module'

// this file contains only a simple test; its main purpose is to provide
// the required mock states for other tests for this module

export const emptyTodoState: TodoState = {
  todosById: {},
  todoIds: [],
}

export const todo1: Todo = {
  id: '1',
  description: 'go shopping',
  isDone: false,
}

export const todo2: Todo = {
  id: '2',
  description: 'clean house',
  isDone: false,
}

export const todo3: Todo = {
  id: '3',
  description: 'work out',
  isDone: true,
}

export const todoStateWithOneTodo: TodoState = {
  todosById: { '1': todo1 },
  todoIds: ['1'],
}

export const todoStateWithTwoTodos: TodoState = {
  todosById: { '1': todo1, '2': todo2 },
  todoIds: ['1', '2'],
}

export const todoStateWithTwoPendingAndOneDoneTodo: TodoState = {
  todosById: { '1': todo1, '2': todo2, '3': todo3 },
  todoIds: ['1', '2', '3'],
}

describe('todos module', () => {
  it('is empty initially', () => {
    expect(getTodosState()).toEqual(emptyTodoState)
  })
})

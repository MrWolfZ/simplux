// this code is part of the simplux recipe "testing my code that uses mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations

import { createMutations, createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of Todo items
export interface Todo {
  id: string
  description: string
}

export interface TodoState {
  [id: string]: Todo
}

const initialState: TodoState = {}

const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})

export const getTodos = todosModule.getState
export const setTodos = todosModule.setState

export const { addTodo } = createMutations(todosModule, {
  addTodo(todosById, todo: Todo) {
    todosById[todo.id] = todo
  },
})

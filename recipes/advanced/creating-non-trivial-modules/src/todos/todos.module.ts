// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of entities, specifically Todo items
export interface Todo {
  id: string
  description: string
  isDone: boolean
}

export interface TodoState {
  todosById: { [id: string]: Todo }
  todoIds: string[]
}

const initialState: TodoState = {
  todosById: {},
  todoIds: [],
}

export const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})

export const getTodosState = todosModule.getState

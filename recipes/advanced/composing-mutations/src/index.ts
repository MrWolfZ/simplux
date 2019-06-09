// this code is part of the simplux recipe "composing mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/composing-mutations

import { createSimpluxModule } from '@simplux/core'
// we are also going to use the immer extension to make our life easier
import '@simplux/immer'

// for this recipe we use a simple scenario: managing a collection
// of Todo items
interface Todo {
  id: string
  description: string
  isDone: boolean
}

interface TodoState {
  todosById: { [id: string]: Todo }
  todoIds: string[]
}

const initialState: TodoState = {
  todosById: {},
  todoIds: [],
}

const { createMutations } = createSimpluxModule({
  name: 'todos',
  initialState,
})

// we want two mutations: one for adding a single todo item and
// one for adding multiple items at once

const { addTodo, addMultipleTodos } = createMutations({
  addTodo({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },

  // instead of repeating the logic for adding the todo item we
  // want to re-use the logic we already have for a single item,
  // that is we want to compose our mutations; to do this we can
  // simply call the mutation with the state
  addMultipleTodos(state, todos: Todo[]) {
    todos.forEach(t => addTodo.withState(state)(t))
  },
})

// we can also do the same with the default immutable style of
// writing mutations, but for this we need to create the mutation
// separately to allow TypeScript to properly infer all types
const { addMultipleTodosDefaultStyle } = createMutations({
  addMultipleTodosDefaultStyle(state, todos: Todo[]) {
    return todos.reduce((s, t) => addTodo.withState(s)(t), state)
  },
})

console.log(
  'added multiple Todo items:',
  addMultipleTodos([
    { id: '1', description: 'go shopping', isDone: false },
    { id: '2', description: 'clean house', isDone: false },
  ]),
)

console.log(
  'added multiple Todo items default style:',
  addMultipleTodosDefaultStyle([
    { id: '3', description: 'bring out trash', isDone: false },
    { id: '4', description: 'go to the gym', isDone: false },
  ]),
)

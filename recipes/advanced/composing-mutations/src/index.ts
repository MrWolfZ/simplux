// this code is part of the simplux recipe "composing my mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/composing-mutations

import { createMutations, createSimpluxModule } from '@simplux/core'

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

const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})

// we want two mutations: one for adding a single todo item and
// one for adding multiple items at once

const { addTodo, addMultipleTodos } = createMutations(todosModule, {
  addTodo({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },

  // instead of repeating the logic for adding the todo item we
  // want to re-use the logic we already have for a single item,
  // that is we want to compose our mutations; to do this we can
  // simply call the mutation with the state
  addMultipleTodos(state, todos: Todo[]) {
    const addTodoWithState = addTodo.withState(state)
    todos.forEach(addTodoWithState)
  },
})

console.log(
  'added single Todo item:',
  addTodo({ id: '1', description: 'go shopping', isDone: false }),
)

console.log(
  'added multiple Todo items:',
  addMultipleTodos([
    { id: '2', description: 'clean house', isDone: false },
    { id: '3', description: 'go to the gym', isDone: false },
  ]),
)

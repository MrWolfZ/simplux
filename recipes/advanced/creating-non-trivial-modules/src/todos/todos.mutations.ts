// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { createMutations } from '@simplux/core'
import { Todo, todosModule } from './todos.module'

// for updating our collection of entities we need mutations for adding
// and removing items

export const { addTodo, addTodos, removeTodoById } = createMutations(
  todosModule,
  {
    addTodo({ todosById, todoIds }, todo: Todo) {
      todosById[todo.id] = todo
      todoIds.push(todo.id)
    },

    addTodos(state, ...todos: Todo[]) {
      // see the recipe for "composing my mutations" for more details about
      // this style of writing mutations
      todos.forEach(t => addTodo.withState(state)(t))
    },

    // it is recommended to code defensively, i.e. to check
    // if an item exists before trying to remove it
    removeTodoById({ todosById, todoIds }, id: string) {
      const idx = todoIds.indexOf(id)
      if (idx >= 0) {
        delete todosById[id]
        todoIds.splice(idx, 1)
      }
    },
  },
)

// we also want a mutation for marking an item as done

export const { markTodoAsDone } = createMutations(todosModule, {
  // once again we check defensively if the item exists; alternatively
  // we could also throw an Error, depending on your requirements
  markTodoAsDone({ todosById }, todoId: string) {
    if (!todosById[todoId]) {
      return
    }

    todosById[todoId].isDone = true
  },
})

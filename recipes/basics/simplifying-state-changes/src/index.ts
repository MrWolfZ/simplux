// this code is part of the simplux recipe "simplifying state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/simplifying-state-changes

import { createSimpluxModule } from '@simplux/core'
// this import registers the simplux immer extension;
// the immer extension allows us to write our mutations in a
// "mutable" style (see https://github.com/immerjs/immer for
// more details)
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

// let's create mutations for adding a todo item to our collection and
// for marking an item as done

const { addTodo, markTodoAsDone } = createMutations({
  // this mutation uses the default immutable style that forces us to
  // return a new updated object
  addTodo({ todosById, todoIds }, todo: Todo) {
    return {
      todosById: { ...todosById, [todo.id]: todo },
      todoIds: [...todoIds, todo.id],
    }
  },

  // it gets even worse if we try to update a nested object
  markTodoAsDone(state, todoId: string) {
    return {
      ...state,
      todosById: {
        ...state.todosById,
        [todoId]: { ...state.todosById[todoId], isDone: true },
      },
    }
  },
})

// now let's see how the immer extension helps us to simplify these
// mutations

const { addTodoSimpler, markTodoAsDoneSimpler } = createMutations({
  // this mutation uses a new mutable style that allows us to write
  // normal JavaScript assignments and perform mutating function calls
  // (like the push function for arrays) while still not changing the
  // module's state directly, thereby keeping the benefits of immutability
  addTodoSimpler({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },

  // we can even change properties in nested objects
  markTodoAsDoneSimpler({ todosById }, todoId: string) {
    todosById[todoId].isDone = true
  },
})

console.log(
  'added Todo item with immutable style:',
  addTodo({ id: '1', description: 'go shopping', isDone: false }),
)

console.log(
  'added Todo item with mutable style:',
  addTodoSimpler({ id: '2', description: 'clean house', isDone: false }),
)

console.log('mark Todo item as done:', markTodoAsDone('2'))

console.log('mark Todo item as done:', markTodoAsDoneSimpler('1'))

console.log('unchanged initial state:', initialState)

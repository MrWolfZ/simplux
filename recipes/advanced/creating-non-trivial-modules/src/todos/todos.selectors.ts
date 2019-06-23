// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { createSelectors } from '@simplux/selectors'
import { Todo, todosModule } from './todos.module'

// for using our collection of entities let's create some selectors

export const {
  selectTodoIds,
  selectNumberOfTodos,
  selectAllTodos,
  selectPendingTodos,
  selectTodoById,
} = createSelectors(todosModule, {
  // optionally we can explicitly annotate the function with a return
  // type that indicates the value is readonly to prevent accidental
  // direct mutations of the returned value
  selectTodoIds: ({ todoIds }): readonly string[] => todoIds,

  selectNumberOfTodos: ({ todoIds }) => todoIds.length,

  selectAllTodos: ({ todoIds, todosById }) => todoIds.map(id => todosById[id]),

  // see the recipe for "composing my selectors" for more details about
  // this style of writing selectors
  selectPendingTodos: (state): Todo[] =>
    selectAllTodos(state).filter(t => !t.isDone),

  // we use an explicit type annotation to express that the accessed
  // Todo item might not exists, which allows TypeScript to prevent
  // bugs in strict mode
  selectTodoById: ({ todosById }, id: string): Todo | undefined =>
    todosById[id],
})

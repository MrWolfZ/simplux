// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { getTodosState } from './todos/todos.module'
import { addTodo, addTodos, markTodoAsDone } from './todos/todos.mutations'
import {
  selectNumberOfTodos,
  selectPendingTodos,
  selectTodoById,
} from './todos/todos.selectors'

console.log(
  'add single Todo:',
  addTodo({ id: '1', description: 'go shopping', isDone: false }),
)

console.log('number of Todos:', selectNumberOfTodos(getTodosState()))

console.log(
  'add multiple Todos:',
  addTodos(
    { id: '2', description: 'clean house', isDone: false },
    { id: '3', description: 'work out', isDone: false },
  ),
)

console.log('mark Todo item as done:', markTodoAsDone('2'))

console.log('pending todos:', selectPendingTodos.withLatestModuleState())

console.log('todo 3:', selectTodoById.withLatestModuleState('3'))

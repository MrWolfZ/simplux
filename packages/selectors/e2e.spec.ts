// this file contains an end-to-end test for the public API

import { createSimpluxModule } from '@simplux/core'
import '@simplux/selectors'

describe(`@simplux/selectors`, () => {
  interface Todo {
    id: string
    description: string
    isDone: boolean
  }

  interface TodoState {
    todosById: { [id: string]: Todo }
    todoIds: string[]
  }

  const todo1: Todo = { id: '1', description: 'go shopping', isDone: true }
  const todo2: Todo = { id: '2', description: 'clean house', isDone: false }

  const todoStoreWithTwoTodos: TodoState = {
    todosById: { '1': todo1, '2': todo2 },
    todoIds: ['1', '2'],
  }

  it('works', () => {
    const { createSelectors } = createSimpluxModule({
      name: 'todos',
      initialState: todoStoreWithTwoTodos,
    })

    const { nrOfTodos, getTodosWithDoneState } = createSelectors({
      nrOfTodos: ({ todoIds }) => todoIds.length,
      getTodosWithDoneState({ todoIds, todosById }, isDone: boolean) {
        return todoIds.map(id => todosById[id]).filter(t => t.isDone === isDone)
      },
    })

    const { nrOfTodosTimes2 } = createSelectors({
      nrOfTodosTimes2: s => nrOfTodos(s) * 2,
    })

    expect(nrOfTodos(todoStoreWithTwoTodos)).toBe(2)
    expect(nrOfTodosTimes2(todoStoreWithTwoTodos)).toBe(4)
    expect(getTodosWithDoneState(todoStoreWithTwoTodos, true)).toEqual([todo1])
  })
})

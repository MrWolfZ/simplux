// this file contains an end-to-end test for the public API

import { createModuleServiceBaseClass } from '@simplux/angular'
import { createMutations, createSimpluxModule } from '@simplux/core'
import { createSelectors } from '@simplux/selectors'

describe(`@simplux/angular`, () => {
  interface Todo {
    id: string
    description: string
    isDone: boolean
  }

  interface TodoState {
    todosById: { [id: string]: Todo }
    todoIds: string[]
  }

  const initialTodoState: TodoState = {
    todosById: {},
    todoIds: [],
  }

  const todo1: Todo = { id: '1', description: 'go shopping', isDone: false }
  const todo2: Todo = { id: '2', description: 'clean house', isDone: true }

  const todoStoreWithTodo1: TodoState = {
    todosById: { '1': todo1 },
    todoIds: ['1'],
  }

  const todoStoreWithTodo2: TodoState = {
    todosById: { '2': todo2 },
    todoIds: ['2'],
  }

  const todoStoreWithBothTodos: TodoState = {
    todosById: { '1': todo1, '2': todo2 },
    todoIds: ['1', '2'],
  }

  it('works', () => {
    const todosModule = createSimpluxModule({
      name: 'todos',
      initialState: initialTodoState,
    })

    const mutations1 = createMutations(todosModule, {
      addTodo({ todosById, todoIds }, todo: Todo) {
        todosById[todo.id] = todo
        todoIds.push(todo.id)
      },
      markAsDone({ todosById }, todoId: string) {
        todosById[todoId].isDone = true
      },
    })

    const mutations2 = createMutations(todosModule, {
      removeTodo({ todosById, todoIds }, id: string) {
        const idx = todoIds.indexOf(id)
        if (idx >= 0) {
          delete todosById[id]
          todoIds.splice(idx, 1)
        }
      },
    })

    const selectors1 = createSelectors(todosModule, {
      selectNumberOfTodos: ({ todoIds }) => todoIds.length,
    })

    const selectors2 = createSelectors(todosModule, {
      selectTodosWithDoneState({ todoIds, todosById }, isDone: boolean) {
        return todoIds.map(id => todosById[id]).filter(t => t.isDone === isDone)
      },
    })

    // tslint:disable-next-line: no-inferred-empty-object-type
    const TodosModuleServiceBase = createModuleServiceBaseClass(
      todosModule,
      { ...mutations1, ...mutations2 },
      { ...selectors1, ...selectors2 },
    )

    class TodosModuleService extends TodosModuleServiceBase {}
    const service: TodosModuleService = new TodosModuleService()

    const subscriber0 = jest.fn()
    const subscriber1 = jest.fn()
    const subscriber2 = jest.fn()

    service.selectState().subscribe(subscriber0)
    service.selectNumberOfTodos().subscribe(subscriber1)
    service.selectTodosWithDoneState(true).subscribe(subscriber2)

    service.addTodo(todo1)
    service.addTodo(todo2)
    service.markAsDone(todo1.id)
    service.removeTodo(todo1.id)
    service.removeTodo(todo1.id)

    expect(service.getCurrentState()).toEqual(todoStoreWithTodo2)

    expect(subscriber0).toHaveBeenCalledTimes(5)
    expect(subscriber0).toHaveBeenCalledWith(initialTodoState)
    expect(subscriber0).toHaveBeenCalledWith(todoStoreWithTodo1)
    expect(subscriber0).toHaveBeenCalledWith(todoStoreWithTodo2)
    expect(subscriber0).toHaveBeenCalledWith(todoStoreWithBothTodos)

    expect(subscriber1).toHaveBeenCalledTimes(4)
    expect(subscriber1).toHaveBeenCalledWith(0)
    expect(subscriber1).toHaveBeenCalledWith(1)
    expect(subscriber1).toHaveBeenCalledWith(2)

    expect(subscriber2).toHaveBeenCalledTimes(5)
    expect(subscriber2).toHaveBeenCalledWith([])
    expect(subscriber2).toHaveBeenCalledWith([todo2])
    expect(subscriber2).toHaveBeenCalledWith([
      { ...todo1, isDone: true },
      todo2,
    ])
  })
})

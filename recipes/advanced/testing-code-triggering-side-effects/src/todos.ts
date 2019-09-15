// this code is part of the simplux recipe "testing my code that triggers side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-triggering-side-effects

import {
  createEffect,
  createMutations,
  createSimpluxModule,
} from '@simplux/core'

export interface Todo {
  id: string
  description: string
  isDone: boolean
}

export interface TodoState {
  [id: string]: Todo
}

const initialState: TodoState = {}

export const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})

export const { setTodoItems } = createMutations(todosModule, {
  setTodoItems(state, items: Todo[]) {
    for (const id of Object.keys(state)) {
      delete state[id]
    }

    for (const item of items) {
      state[item.id] = item
    }
  },
})

// this effect simulates calling our API
export const loadTodosFromApi = createEffect(
  async (includeDoneItems: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 200))

    const todos = [
      { id: '1', description: 'go shopping', isDone: false },
      { id: '2', description: 'clean house', isDone: true },
      { id: '3', description: 'bring out trash', isDone: true },
      { id: '4', description: 'go to the gym', isDone: false },
    ] as Todo[]

    return todos.filter(t => !t.isDone || includeDoneItems)
  },
)

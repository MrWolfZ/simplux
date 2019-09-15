// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import {
  createEffect,
  createMutations,
  createSimpluxModule,
} from '@simplux/core'
import { loadItemsViaHttp } from './api'

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

// this is the effect we want to test; this effect consists of two
// parts, 1) the data fetching and 2) some post-processing logic;
// to test this effect we should mock 1) to test the logic of 2)
export const loadTodosFromApi = createEffect(
  async (includeDoneItems: boolean) => {
    // 1) data fetching
    const todos = await loadItemsViaHttp()

    // 2) post-processing logic
    return todos.filter(t => !t.isDone || includeDoneItems)
  },
)

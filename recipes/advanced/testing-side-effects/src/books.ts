// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import {
  createEffect,
  createMutations,
  createSimpluxModule,
} from '@simplux/core'
import { loadItemsViaHttp } from './api'

export interface Book {
  id: string
  title: string
  author: string
}

export interface BooksState {
  [id: string]: Book
}

const initialState: BooksState = {}

const booksModule = createSimpluxModule({
  name: 'books',
  initialState,
})

const booksMutations = createMutations(booksModule, {
  setItems(_, items: Book[]) {
    const newState: BooksState = {}

    for (const item of items) {
      newState[item.id] = item
    }

    return newState
  },
})

// this is the effect we want to test; this effect consists of two
// parts, 1) the data fetching and 2) some post-processing logic;
// to test the logic of 2) we should mock 1)
const loadFromApi = createEffect(async (authorFilter: string) => {
  // 1) data fetching
  const result = await loadItemsViaHttp()

  // 2) post-processing logic
  return !authorFilter ? result : result.filter(t => t.author === authorFilter)
})

export const books = {
  ...booksModule,
  ...booksMutations,
  loadFromApi,
}

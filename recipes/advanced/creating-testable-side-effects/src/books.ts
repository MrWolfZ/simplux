// this code is part of the simplux recipe "creating testable side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-testable-side-effects

import { createEffect, createMutations, createSimpluxModule } from '@simplux/core'
import { httpGet } from './http'

export interface Book {
  id: string
  title: string
  author: string
}

const booksModule = createSimpluxModule<Book[]>({
  name: 'books',
  initialState: [],
})

const booksMutations = createMutations(booksModule, {
  setAll: (_, books: Book[]) => books,
})

const loadFromApi = createEffect(async (authorFilter: string) => {
  const result = await httpGet<Book[]>(`https://my.domain.com/books?authorFilter=${authorFilter}`)

  books.setAll(result)
  return result
})

export const books = {
  ...booksModule,
  ...booksMutations,
  loadFromApi,
}

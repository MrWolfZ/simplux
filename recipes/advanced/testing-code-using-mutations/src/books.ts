// this code is part of the simplux recipe "testing my code that uses mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations

import { createMutations, createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of books
export interface Book {
  id: string
  title: string
  author: string
}

export interface BooksState {
  [id: string]: Book
}

const initialState: BooksState = {}

const booksModule = createSimpluxModule('books', initialState)

export const books = {
  ...booksModule,
  ...createMutations(booksModule, {
    addBook(state, book: Book) {
      state[book.id] = book
    },
  }),
}

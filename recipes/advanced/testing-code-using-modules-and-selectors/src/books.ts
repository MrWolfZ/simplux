// this code is part of the simplux recipe "testing my code that uses modules and selectors":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-modules-and-selectors

import { createSelectors, createSimpluxModule } from '@simplux/core'

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
  ...createSelectors(booksModule, {
    titleById: (state, id: string) => state[id]?.title,
    allTitles: (state) => Object.keys(state).map((id) => state[id].title),
  }),
}

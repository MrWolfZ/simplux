// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of entities, specifically books
export interface Book {
  id: string
  title: string
  author: string
  amountInStock: number
}

// for non-trivial modules like this we recommend to create explicit
// interfaces for the state instead of having the type of state inferred
// from the initial state value; this makes testing the module simpler
// as well as making type signatures for mutations and selectors  easier
// to understand
export interface BooksState {
  booksById: { [id: string]: Book }
  bookIds: string[]
}

const initialState: BooksState = {
  booksById: {},
  bookIds: [],
}

export const booksModule = createSimpluxModule('books', initialState)

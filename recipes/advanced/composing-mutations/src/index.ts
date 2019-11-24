// this code is part of the simplux recipe "composing my mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/composing-mutations

import { createMutations, createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of books
interface Book {
  id: string
  title: string
  author: string
}

interface BooksState {
  booksById: { [id: string]: Book }
  bookIds: string[]
}

const initialState: BooksState = {
  booksById: {},
  bookIds: [],
}

const booksModule = createSimpluxModule({
  name: 'books',
  initialState,
})

// we want two mutations: one for adding a single book and
// one for adding multiple books at once

const booksMutations = createMutations(booksModule, {
  add({ booksById, bookIds }, book: Book) {
    booksById[book.id] = book
    bookIds.push(book.id)
  },

  // instead of repeating the logic for adding the book we want
  // to re-use the logic we already have for a single item; in
  // other words, we want to compose our mutations; this can be
  // achieved by calling the mutation via `withState`; usually,
  // when a mutation is called with a state it creates a modified
  // copy of the state instead of mutating the state directly;
  // however, simplux is able to detect when a mutation is used
  // within another mutation and allows changing the state object
  // directly in this situation
  addMultiple(state, books: Book[]) {
    books.forEach(book => booksMutations.add.withState(state, book))
  },
})

const books = {
  ...booksModule,
  ...booksMutations,
}

console.log(
  'added single book:',
  books.add({
    id: '1',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
  }),
)

console.log(
  'added multiple books:',
  books.addMultiple([
    { id: '2', title: 'The Black Company', author: 'Glen Cook' },
    { id: '3', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
  ]),
)

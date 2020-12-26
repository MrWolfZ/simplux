// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { Book, booksModule, BooksState } from './books.module'

// this file contains only a simple test; its main purpose is to provide
// the required mock states for other tests for this module

export const emptyBooksState: BooksState = {
  booksById: {},
  bookIds: [],
}

export const book1: Book = {
  id: '1',
  title: 'The Lord of the Rings',
  author: 'J.R.R. Tolkien',
  amountInStock: 100,
}

export const book2: Book = {
  id: '2',
  title: 'The Black Company',
  author: 'Glen Cook',
  amountInStock: 20,
}

export const book3: Book = {
  id: '3',
  title: 'Nineteen Eighty-Four',
  author: 'George Orwell',
  amountInStock: 0,
}

export const booksStateWithOneBook: BooksState = {
  booksById: { '1': book1 },
  bookIds: ['1'],
}

export const booksStateWithTwoBooks: BooksState = {
  booksById: { '1': book1, '2': book2 },
  bookIds: ['1', '2'],
}

export const booksStateWithTwoAvailableAndOneSoldOutBook: BooksState = {
  booksById: { '1': book1, '2': book2, '3': book3 },
  bookIds: ['1', '2', '3'],
}

describe('books module', () => {
  it('is empty initially', () => {
    expect(booksModule.state()).toEqual(emptyBooksState)
  })
})

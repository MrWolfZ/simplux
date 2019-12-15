// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import {
  book1,
  book2,
  booksStateWithOneBook,
  booksStateWithTwoBooks,
  emptyBooksState,
} from './books.module.spec'
import { booksMutations } from './books.mutations'

const { addBook, addBooks, removeBookById, setAmountInStock } = booksMutations

describe('books module', () => {
  describe('mutations', () => {
    describe('addBook', () => {
      it('adds a single book', () => {
        const updatedState = addBook.withState(emptyBooksState, book1)
        expect(updatedState).toEqual(booksStateWithOneBook)
      })
    })

    describe('addBooks', () => {
      it('adds a single book', () => {
        const updatedState = addBooks.withState(emptyBooksState, book1)
        expect(updatedState).toEqual(booksStateWithOneBook)
      })

      it('adds multiple books', () => {
        const updatedState = addBooks.withState(emptyBooksState, book1, book2)
        expect(updatedState).toEqual(booksStateWithTwoBooks)
      })
    })

    describe('removeBookById', () => {
      it('removes a book by id', () => {
        const updatedState = removeBookById.withState(booksStateWithTwoBooks, book2.id)
        expect(updatedState).toEqual(booksStateWithOneBook)
      })

      it('does not change the state if the book does not exist', () => {
        const updatedState = removeBookById.withState(booksStateWithTwoBooks, 'does-not-exist')
        expect(updatedState).toBe(booksStateWithTwoBooks)
      })
    })

    describe('setAmountInStock', () => {
      it('sets the amount in stock of the correct book', () => {
        const updatedState = setAmountInStock.withState(booksStateWithTwoBooks, book2.id, 200)
        expect(updatedState.booksById[book2.id].amountInStock).toBe(200)
      })

      it('does not change the state if the amount does not change', () => {
        const updatedState = setAmountInStock.withState(
          booksStateWithTwoBooks,
          book2.id,
          book2.amountInStock,
        )
        expect(updatedState).toBe(booksStateWithTwoBooks)
      })
    })
  })
})

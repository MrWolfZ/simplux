// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import {
  book1,
  book2,
  book3,
  booksStateWithTwoAvailableAndOneSoldOutBook,
  booksStateWithTwoBooks,
} from './books.module.spec'
import { booksSelectors } from './books.selectors'

const { ids, numberOfBooks, all, outOfStock, byId } = booksSelectors

describe('books module', () => {
  describe('selectors', () => {
    describe('ids', () => {
      it('returns the array of IDs', () => {
        const result = ids.withState(booksStateWithTwoBooks)
        expect(result).toEqual(['1', '2'])
      })
    })

    describe('numberOfBooks', () => {
      it('returns the number of books', () => {
        const result = numberOfBooks.withState(booksStateWithTwoBooks)
        expect(result).toBe(2)
      })
    })

    describe('all', () => {
      it('returns an array of all books', () => {
        const books = all.withState(booksStateWithTwoBooks)
        expect(books).toEqual([book1, book2])
      })
    })

    describe('outOfStock', () => {
      it('returns an array of all items that are out of stock', () => {
        const books = outOfStock.withState(booksStateWithTwoAvailableAndOneSoldOutBook)
        expect(books).toEqual([book3])
      })
    })

    describe('byId', () => {
      it('returns a book by ID', () => {
        const selectedBook = byId.withState(booksStateWithTwoAvailableAndOneSoldOutBook, book2.id)

        expect(selectedBook).toEqual(book2)
      })

      it('returns undefined if the book does not exist', () => {
        const selectedBook = byId.withState(booksStateWithTwoBooks, 'does-not-exist')

        expect(selectedBook).toBeUndefined()
      })
    })
  })
})

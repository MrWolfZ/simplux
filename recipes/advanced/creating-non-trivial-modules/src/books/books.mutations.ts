// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { createMutations } from '@simplux/core'
import { Book, booksModule } from './books.module'

// for updating our collection of entities we need mutations for adding
// and removing items; for simplicity this code leaves out some error
// and edge case handling you would want in a production application

export const booksMutations = createMutations(booksModule, {
  addBook({ booksById, bookIds }, book: Book) {
    booksById[book.id] = book
    bookIds.push(book.id)
  },

  addBooks(state, ...books: Book[]) {
    // see the recipe for "composing my mutations" for more details about
    // this style of writing mutations
    books.forEach(book => booksMutations.addBook.withState(state, book))
  },

  removeBookById({ booksById, bookIds }, id: string) {
    const idx = bookIds.indexOf(id)
    if (idx >= 0) {
      delete booksById[id]
      bookIds.splice(idx, 1)
    }
  },

  // we also want a mutation for setting the amount in stock; this example
  // shows how easy it is to update deeply nested objects thanks to immer
  setAmountInStock({ booksById }, bookId: string, amount: number) {
    booksById[bookId].amountInStock = amount
  },
})

// this code is part of the simplux recipe "creating non-trivial modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules

import { createSelectors } from '@simplux/core'
import { Book, booksModule } from './books.module'

// for using our collection of books let's create some selectors

export const booksSelectors = createSelectors(booksModule, {
  // optionally we can explicitly annotate the function with a return
  // type that indicates the value is readonly to prevent accidental
  // direct mutations of the returned value
  ids: ({ bookIds }): ReadonlyArray<string> => bookIds,

  numberOfBooks: ({ bookIds }) => bookIds.length,

  all: ({ bookIds, booksById }) => bookIds.map(id => booksById[id]),

  // see the recipe for "composing my selectors" for more details about
  // this style of writing selectors
  outOfStock: (state): Book[] =>
    booksSelectors.all
      .withState(state)
      .filter(book => book.amountInStock === 0),

  // we use an explicit type annotation to express that the accessed
  // book might not exists, which allows TypeScript to prevent bugs
  // in strict mode
  byId: ({ booksById }, id: string): Book | undefined => booksById[id],
})

// this code is part of the simplux recipe "composing my selectors":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/composing-selectors

import { createSelectors, createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of books
interface Book {
  id: string
  title: string
  author: string
}

const initialState: Book[] = [
  { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
  { id: '2', title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { id: '3', title: 'The Black Company', author: 'Glen Cook' },
  { id: '4', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
]

const booksModule = createSimpluxModule('books', initialState)

// we want to select three types of things:
// 1) a set of all authors
// 2) all books by a given author
// 3) all books grouped by author

const booksSelectors = createSelectors(booksModule, {
  allAuthors: books => new Set<string>(books.map(book => book.author)),
  byAuthor: (books, author: string) => books.filter(b => b.author === author),

  // for the third point we can re-use the selectors for the first two points
  // which prevents code duplication; in other words, we want to compose our
  // selectors; to do this we can simply call the other selector with a state;
  // however, TypeScript cannot infer the return type of the selector due to
  // the cyclic dependency, so we need to specify it ourselves
  groupedByAuthor: (books): Map<string, Book[]> => {
    const allAuthors = Array.from(booksSelectors.allAuthors.withState(books))
    return allAuthors.reduce(
      (grouped, author) => grouped.set(author, booksSelectors.byAuthor.withState(books, author)),
      new Map<string, Book[]>(),
    )
  },
})

const books = {
  ...booksModule,
  ...booksSelectors,
}

console.log('authors:', books.allAuthors())
console.log('books by Tolkien:', books.byAuthor('J.R.R. Tolkien'))
console.log('books grouped by author:', books.groupedByAuthor())

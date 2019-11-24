// this code is part of the simplux recipe "performing side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/performing-side-effects

import {
  createEffect,
  createMutations,
  createSimpluxModule,
} from '@simplux/core'

// for this recipe we use a simple scenario: loading data from an API
interface Book {
  id: string
  title: string
  author: string
}

interface BooksState {
  [id: string]: Book
}

const initialState: BooksState = {}

const booksModule = createSimpluxModule({
  name: 'books',
  initialState,
})

const booksMutations = createMutations(booksModule, {
  setItems(_, items: Book[]) {
    const newState: BooksState = {}

    for (const item of items) {
      newState[item.id] = item
    }

    return newState
  },
})

const books = {
  ...booksModule,
  ...booksMutations,
}

// the function below simulates calling our API
async function loadBooksFromApi(authorFilter?: string) {
  await new Promise(resolve => setTimeout(resolve, 200))

  const books: Book[] = [
    { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
    { id: '2', title: 'The Black Company', author: 'Glen Cook' },
    { id: '3', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
  ]

  return authorFilter === undefined
    ? books
    : books.filter(t => t.author === authorFilter)
}

// we can now simply call our data load function and populate the module
loadBooksFromApi()
  .then(books.setItems)
  .then(() => {
    console.log('books:', books.getState())
  })

// while this works, it has a major downside: it is difficult to test;
// simplux provides a `createEffect` function that solves this problem
// by wrapping your side-effectful code in order to allow mocking it
// during testing
const loadBooksFromApiEffect = createEffect(loadBooksFromApi)

// the effect has the exact same signature as your original code;
// how and where you would perform this call in a real application
// depends on your tech stack and architecture (e.g. in a React
// application you might perform this call in a `useEffect` hook)
loadBooksFromApiEffect('J.R.R. Tolkien')
  .then(books.setItems)
  .then(() => {
    console.log('books:', books.getState())
  })

// we recommend to create the effect without an extra function
const setDocumentTitle = createEffect((title: string) => {
  document.title = title
})

setDocumentTitle('simplux')

// this concludes this recipe; for details on how to mock effects during
// testing see the recipe for "testing my code that triggers side effects"

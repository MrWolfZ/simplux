# Recipe: composing my mutations

This recipe shows you how simple it is to compose/re-use your **simplux** mutations.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/composing-mutations).

Before we start let's install **simplux**.

```sh
npm i @simplux/core -S
```

Now we're ready to go.

For this recipe we use a simple scenario: managing a collection of books. Let's create a module for this.

```ts
import { createSimpluxModule } from '@simplux/core'

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

const booksModule = createSimpluxModule('books', initialState)
```

We want to create two mutations for this module: one for adding a single book, and another one for adding multiple books at once. However, instead of duplicating the logic for adding a book we want to re-use the mutation for adding a single book inside the mutation that adds multiple books. In other words, we want to compose our two mutations. Let's see how we can do this.

```ts
import { createMutations } from '@simplux/core'

const booksMutations = createMutations(booksModule, {
  add({ booksById, bookIds }, book: Book) {
    booksById[book.id] = book
    bookIds.push(book.id)
  },

  // mutations can be composed by using `withState`; usually,
  // when a mutation is called with a state it creates a modified
  // copy of the state instead of mutating the state directly;
  // however, simplux is able to detect when a mutation is used
  // within another mutation and allows changing the state object
  // directly in this situation
  addMultiple(state, books: Book[]) {
    books.forEach(book => booksMutations.add.withState(state, book))
  },
})
```

Now we can use our mutations to add books.

```ts
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
```

And that is all you need for composing your mutations with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

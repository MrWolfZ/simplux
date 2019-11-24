# Recipe: creating non-trivial modules

This recipe shows you how you can create **simplux** modules that are as non-trivial as the modules you will typically create in your application.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules).

Before we start let's install **simplux**.

```sh
npm i @simplux/core -S
```

Now we're ready to go.

For this recipe we use a common scenario: managing a collection of entities, specifically books. Let's create our module. For non-trivial modules like this we recommend to create explicit interfaces for the state instead of having the type of state inferred from the initial state value. This makes testing the module simpler as well as making type signatures for mutations and selectors easier to understand.

```ts
import { createSimpluxModule } from '@simplux/core'

interface Book {
  id: string
  title: string
  author: string
  amountInStock: number
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
```

For updating our collection of books we need mutations for adding and removing items.

> **simplux** allows us to write mutations with normal mutating JavaScript code while still keeping all the state updates immutable and simple to test (this is achieved by leveraging [immer](https://github.com/immerjs/immer)). However, if you prefer a more explicit immutable style you can also manually copy the object and return the updated copy instead.

```ts
import { createMutations } from '@simplux/core'

const booksMutations = createMutations(booksModule, {
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
```

Now that we have a way to update our collection of books we need a way to access the collection in a structured way. For this we create selectors (see [this recipe](../../basics/computing-derived-state#readme) if you are unfamilar with selectors).

```ts
import { createSelectors } from '@simplux/core'

const booksSelectors = createSelectors(booksModule, {
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
```

If your module has many mutations and selectors (like the [books module](src/books) in this recipe) we recommend to split it into separate files for the module, its mutations, and its selectors. This makes the module easier to understand and simpler to test. It is also useful to bring all these aspects together in a single export to make the consumer agnostic to the internal file structure of the module.

> The file structure from this recipe is only a recommendation and there are other ways for structuring your modules that work just as well. Regardless of the structure you choose in your application it is important to agree with your team on a common structure and use it consistently.

```ts
import { booksModule } from './books.module'
import { booksMutations } from './books.mutations'
import { booksSelectors } from './books.selectors'

export const books = {
  ...booksModule,
  ...booksMutations,
  ...booksSelectors,
}
```

Now it is time to use our new module.

```ts
import { books } from './books'

console.log(
  'add single book:',
  books.addBook({
    id: '1',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    amountInStock: 100,
  }),
)

console.log('number of books:', books.numberOfBooks())

console.log(
  'add multiple books:',
  books.addBooks(
    {
      id: '2',
      title: 'The Black Company',
      author: 'Glen Cook',
      amountInStock: 20,
    },
    {
      id: '3',
      title: 'Nineteen Eighty-Four',
      author: 'George Orwell',
      amountInStock: 0,
    },
  ),
)

console.log('out of stock:', books.outOfStock())

console.log('update amount in stock:', books.setAmountInStock('3', 200))

console.log('book 3:', books.byId('3'))
```

We hope this recipe could give you some pointers for how you can create non-trivial **simplux** modules in your application.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

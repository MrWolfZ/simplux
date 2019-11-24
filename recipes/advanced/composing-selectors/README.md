# Recipe: composing my selectors

This recipe shows you how simple it is to compose/re-use your **simplux** selectors.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe. The recipe for [computing derived state](../../basics/computing-derived-state#readme) is also helpful for following this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/composing-selectors).

Before we start let's install **simplux**.

```sh
npm i @simplux/preset -S
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

const initialState: Book[] = [
  { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
  { id: '2', title: 'The Hobbit', author: 'J.R.R. Tolkien' },
  { id: '3', title: 'The Black Company', author: 'Glen Cook' },
  { id: '4', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
]

const booksModule = createSimpluxModule({
  name: 'books',
  initialState,
})
```

We want to select three types of things for this module:

1. a set of all authors
2. all books by a given author
3. all books grouped by author

For the third point we can re-use the selectors for the first two points which prevents unnecessary code duplication. In other words, we want to compose our selectors. To do this we can simply call the other selector with a state. Let's see how this looks like in code.

```ts
import { createSelectors } from '@simplux/core'

const booksSelectors = createSelectors(booksModule, {
  allAuthors: books => new Set<string>(books.map(book => book.author)),
  byAuthor: (books, author: string) => books.filter(b => b.author === author),

  // sadly, TypeScript cannot infer the return type of the selector due to
  // the cyclic dependency, so we need to specify it ourselves
  groupedByAuthor: (books): Map<string, Book[]> => {
    const allAuthors = Array.from(booksSelectors.allAuthors.withState(books))
    return allAuthors.reduce(
      (grouped, author) =>
        grouped.set(author, booksSelectors.byAuthor.withState(books, author)),
      new Map<string, Book[]>(),
    )
  },
})
```

We can now use our selectors.

```ts
const books = {
  ...booksModule,
  ...booksSelectors,
}

console.log('authors:', books.allAuthors())
console.log('books by Tolkien:', books.byAuthor('J.R.R. Tolkien'))
console.log('books grouped by author:', books.groupedByAuthor())
```

And that is all you need for composing your selectors with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

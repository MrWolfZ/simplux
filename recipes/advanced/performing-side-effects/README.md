# Recipe: performing side effects

Most web applications contain code which has [side effects](<https://en.wikipedia.org/wiki/Side_effect_(computer_science)>), e.g. changing the document title for the current tab or communicating over the network. Traditionally, this kind of code is difficult to test. **simplux** makes the concept of effects a first-class citizen and thereby solves the testing issue. It is recommended to read the recipes for [testing your code that triggers side effects](../testing-code-triggering-side-effects#readme) as well as the recipe for [testing side effects](../testing-side-effects#readme) after you are done reading through this one.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/performing-side-effects).

Before we start let's install **simplux**.

```sh
npm i @simplux/preset -S
```

Now we're ready to go.

For this recipe we use a common scenario: loading data from an API. Let's create a module for this.

```ts
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
```

For this recipe we simulate loading the data from our API. In a real application you would probably perform an HTTP call for this.

```ts
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
```

We can now use this function to populate our module.

> How and where you would perform this call in a real application depends on your tech stack and architecture (e.g. in a React application you might perform this call in a `useEffect` hook)

```ts
loadBooksFromApi().then(books.setItems)
```

While this works, it has a major downside: it is difficult to test code that calls functions like this. **simplux** provides a `createEffect` function that solves this problem by wrapping your side-effectful code in order to allow mocking it during testing.

```ts
const loadBooksFromApiEffect = createEffect(loadBooksFromApi)
```

The created effect has the exact same signature as your original code and outside of testing it will simply forward the call to your function.

```ts
loadBooksFromApiEffect('J.R.R. Tolkien').then(books.setItems)
```

For most effects we recommend to declare it without an extra function.

```ts
const setDocumentTitle = createEffect((title: string) => {
  document.title = title
})
```

This concludes this recipe. We strongly recommend you read the recipe for [testing your code that triggers side effects](../testing-code-triggering-side-effects#readme) as well as the recipe for [testing side effects](../testing-side-effects#readme) to get to know the full benefits of using **simplux** for your side effects.

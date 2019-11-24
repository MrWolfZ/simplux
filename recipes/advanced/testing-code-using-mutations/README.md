# Recipe: testing my code that uses mutations

This recipe shows you how simple it is to test your code that uses **simplux** mutations.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations).

Before we start let's install **simplux**.

```sh
npm i @simplux/core @simplux/testing -S
```

Now we're ready to go.

For this recipe we use a simple scenario: managing a collection of books. Let's create a module for this.

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

const books = {
  ...booksModule,
  ...createMutations(booksModule, {
    addBook(state, book: Book) {
      state[book.id] = book
    },
  }),
}
```

In our application code we want to create a new book with a random 4 character id.

```ts
function addNewBook(title: string, author: string) {
  const id = `${Math.round(Math.random() * 8999 + 1000)}`
  books.addBook({ id, title, author })
  return id
}
```

This is the code we are going to test.

> You may think that `addNewBook` could be a mutation itself, but it must not be since it is not pure (due the random generation of the id).

The best way to test our code is to test it in isolation from the module. That means we do not want the mutation to be executed during our test. This is where the **simplux** testing extension comes into play: it allows us to mock a mutation.

> It is also possible to test your code that uses mutations with the module by just letting the test call the mutation normally and then checking the module's state to see if the mutation was correctly applied. However, this is not recommended since it can cause side-effects.

```ts
import { mockMutation } from '@simplux/testing'

it('generates a 4 character ID', () => {
  // after this line all invocations of the mutation will be
  // redirected to the provided mock function; for convenience
  // `mockMutation` returns the provided mock function as the
  // first item in its returned tuple
  const [addBookMock] = mockMutation(books.addBook, jest.fn())

  addNewBook('test title', 'test author')

  expect(addBookMock).toHaveBeenCalled()
  expect((addBookMock.mock.calls[0][0] as Book).id.length).toBe(4)
})
```

The `mockMutation` call above mocks our mutation indefinitely. The testing extension provides a way to clear all simplux mocks which we can simply do after each test.

```ts
import { clearAllSimpluxMocks } from '@simplux/testing'

afterEach(clearAllSimpluxMocks)
```

In specific rare situations it can be useful to manually clear a mock during a test. For this the `mockMutation` function returns a callback function as the second item in its returned tuple that can be called to clear the mock.

```ts
it('uses the value as description', () => {
  const [addBookMock, clearAddBookMock] = mockMutation(books.addBook, jest.fn())

  const title = 'test title (mocked)'
  const author = 'test author (mocked)'
  addNewBook(title, author)

  expect(addBookMock).toHaveBeenCalledWith(
    expect.objectContaining({ title, author }),
  )

  clearAddBookMock()

  // after clearing the mock all calls will use the original mutation;
  // note that it is usually a bad idea to call the real mutation
  // during a test like this
  const id = addNewBook('test title', 'test author')
  expect(books.getState()[id].title).toBe('test title')
  books.setState({})
})
```

And that is all you need to test your code that uses **simplux** mutations.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

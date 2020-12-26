# Recipe: testing my code that uses modules and selectors

This recipe shows you how simple it is to test your code that uses **simplux** modules and selectors.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-modules-and-selectors).

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

const booksModule = createSimpluxModule('books', initialState)

const books = {
  ...booksModule,
  ...createSelectors(booksModule, {
    titleById: (state, id: string) => state[id]?.title,
    allTitles: (state) => Object.keys(state).map((id) => state[id].title),
  }),
}
```

In our application code we want to be able to display a single book's title and all book titles.

> In this simple example we'll just log the book titles to the console instead of HTML like you would do in your real application.

```ts
function showBookTitle(id: string) {
  console.log(books.titleById(id) || 'no title')
}

function showAllBookTitles() {
  const titles = books.allTitles()
  console.log(titles.length > 0 ? titles.join(', ') : 'no titles')
}
```

This is the code we are going to test.

The best way to test our code is to test it in isolation from the module. That means we do not want to use the real module's state during our test. This is where the **simplux** testing extension comes into play: it allows us to mock a module's state as well as selectors.

> It is also possible to test your code that uses selectors with the module by setting the module's state via `setState` and then letting the test call the selector normally. However, this is not recommended since it can cause side-effects.

```ts
import { mockModuleState, mockSelector } from '@simplux/testing'

// first, let's take a look at how we can mock a whole module's state
it('showBookTitle logs a book title by ID', () => {
  // we define the test data we want to use for this test case
  const testBook: Book = {
    id: 'book1',
    title: 'test title',
    author: 'test author',
  }

  // after this line all access to the module's state will get
  // the mocked state
  mockModuleState(books, { [testBook.id]: testBook })

  // we have to mock the console.log function to be able to assert
  // our expected result
  const logSpy = jest.spyOn(console, 'log').mockImplementation()

  // now we can call our function with a well-defined and isolated state
  showBookTitle(testBook.id)

  expect(logSpy).toHaveBeenCalledWith(testBook.title)
})

// for code that select only a small portion of a module's state it
// can be cumbersome to mock the whole state; in those cases you can
// mock a selector directly
it('showAllBookTitles logs a all book titles', () => {
  // we only need to define the test data that our selector should
  // return instead of the whole module's state
  const titles = ['title 1', 'title 2']

  // after this line all calls to the selector will call our mock
  // function instead
  mockSelector(books.allTitles, () => titles)

  // note that instead of a plain function you could also create
  // a spy (e.g. with jest.fn()); for convenience the `mockSelector`
  // function returns the provided function as the first item in
  // its result tuple so that you can use this pattern:
  // const [spy] = mockSelector(books.allTitles, jest.fn())
  // spy.mockReturnValueOnce(titles)

  const logSpy = jest.spyOn(console, 'log').mockImplementation()

  // now we can call our function with a well-defined and isolated
  // return value of the selector
  showAllBookTitles()

  expect(logSpy).toHaveBeenCalledWith(titles)
})
```

The `mockModuleState` and `mockSelector` calls above mock the state and selector indefinitely. The testing extension provides a way to clear all simplux mocks which we can simply do after each test.

```ts
import { clearAllSimpluxMocks } from '@simplux/testing'

afterEach(clearAllSimpluxMocks)
```

In specific rare situations it can be useful to manually clear a mock during a test. For this the `mockModuleState` and `mockSelector` functions return callback functions that can be called to clear the mocks.

```ts
it('showBookTitle logs "no title" if book does not exist', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation()

  const testBook: Book = {
    id: 'book1',
    title: 'test title',
    author: 'test author',
  }

  const clearMockState = mockModuleState(books, { [testBook.id]: testBook })

  showBookTitle('does not exist')

  expect(logSpy).toHaveBeenCalledWith('no title')

  // after this point all access to the module's state will return the
  // real state
  clearMockState()
})

it('showAllBookTitles logs "no titles" if state has no books', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation()

  const [, clearSelectorMock] = mockSelector(books.allTitles, () => [])

  showAllBookTitles()

  expect(logSpy).toHaveBeenCalledWith('no titles')

  // after this point all calls to the selector state will evaluate
  // the selector against the real module's state
  clearSelectorMock()
})
```

And that is all you need to test your code that uses **simplux** modules and selectors.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

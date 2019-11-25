# Recipe: creating testable side effects

Most web applications contain code which has [side effects](<https://en.wikipedia.org/wiki/Side_effect_(computer_science)>), e.g. changing the document title for the current browser tab or communicating over the network. Traditionally, this kind of code is difficult to test. **simplux** makes the concept of effects a first-class citizen and thereby provides a solution to the testing issue. This recipe shows you how **simplux** helps you create testable side effects.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/creating-testable-side-effects).

Before we start let's install **simplux**.

```sh
npm i @simplux/core @simplux/testing -S
```

Now we're ready to go.

Let's start with two very simple side effects: reading and setting the document title of the current browser tab.

```ts
// by default the returned function simply calls the provided function
const getDocumentTitle = createEffect(() => document.title)

const setDocumentTitle = createEffect((title: string) => {
  document.title = title
})
```

These simple looking effects provide some interesting challenges for testing. There are two scenarios to consider:

#### Testing an effect itself

For our effects above you will either need to write an integration test that runs in a browser and really reads and sets the title. Or you will need to run the test in an environment that mocks the `document` and allows you to assert the title was set correctly, although this just moves the responsibility for mocking to a different library or framework. Since the effects are so simple you may also decide to omit testing them at all and instead focus on the more interesting scenario below.

#### Testing other code that uses this effect

This is where **simplux** can make your life simple. Each **simplux** effect can be mocked with the help of the `mockEffect` function from the testing package. Let's say we have a function to show a notification count in the tab title.

```ts
const prefixDocumentTitleWithNotificationCount = (count: number) => {
  const currentTitle = getDocumentTitle()
  const prefixedTitle = `(${count}) ${currentTitle}`
  setDocumentTitle(prefixedTitle)
}
```

Without **simplux** it would be difficult to test this function. However, since we can mock effects it becomes quite simple.

```ts
import { mockEffect } from '@simplux/testing'

describe('prefixDocumentTitleWithNotificationCount', () => {
  it('prefixes the current title with the given count', () => {
    const currentTitle = 'test title'

    // after this line the provided function will be called instead
    // of the real effect until the mock is cleared
    mockEffect(getDocumentTitle, () => currentTitle)

    // for convenience `mockEffect` returns the mock function as the
    // first item in the returned tuple (the second item is a callback
    // that clears the mock)
    const [setTitleMock] = mockEffect(setDocumentTitle, jest.fn())

    // now we can safely call our function without it causing any
    // undesired side effects
    prefixDocumentTitleWithNotificationCount(5)

    // and we can assert the function worked correctly
    expect(setTitleMock).toHaveBeenCalledWith('(5) test title')
  })
})
```

The `mockEffect` call above mocks our effect indefinitely (or until it is manually cleared via the second item in the returned tuple). The testing package provides a way to clear all simplux mocks which we can simply do after each test.

```ts
import { clearAllSimpluxMocks } from '@simplux/testing'

afterEach(clearAllSimpluxMocks)
```

Now let's go one step further and assume we have some code (maybe a UI component) that calls the `prefixDocumentTitleWithNotificationCount`. To test that code you would always have to mock both `getDocumentTitle` and `setDocumentTitle`, which can become quite noisy. However, as you probably already guessed, there is an alternative approach: make `prefixDocumentTitleWithNotificationCount` an effect itself.

```ts
const prefixDocumentTitleWithNotificationCount = createEffect(
  (count: number) => {
    const currentTitle = getDocumentTitle()
    const prefixedTitle = `(${count}) ${currentTitle}`
    setDocumentTitle(prefixedTitle)
  },
)
```

This allows us to mock it directly where necessary without having to mock the lower level effects. We can see a pattern emerging here:

> Create minimal low level effects that are either integration tested or not tested due to their simplicity. Then build more complex yet unit testable higher level effects based on the lower level ones.

Let's apply this pattern for another very common scenario: loading data from a web API. We start with a minimal low level effect for making HTTP `GET` calls.

```ts
const httpGet = createEffect(
  <T>(url: string): Promise<T> => {
    // ...use whatever library you prefer for making HTTP calls; use that library's
    // testing capabilities to test this effect
  },
)
```

Now let's say we have a simple **simplux** module for managing a collection of books.

```ts
interface Book {
  id: string
  title: string
  author: string
}

const booksModule = createSimpluxModule<Book[]>({
  name: 'books',
  initialState: [],
})

const books = {
  ...booksModule,
  ...createMutations(booksModule, {
    setAll: (_, books: Book[]) => books,
  }),
}
```

We want to populate the module with data from our API.

```ts
const loadBooksFromApi = createEffect(async (authorFilter: string) => {
  const result = await httpGet<Book[]>(
    `https://my.domain.com/books?authorFilter=${authorFilter}`,
  )
  books.setAll(result)
  return result
})
```

Thanks to **simplux** this effect is simple to test since we can mock both the `httpGet` effect as well as the `setAll` mutation ([this recipe](../testing-code-using-mutations#readme) will help you if you are unfamiliar with mocking mutations). At the same time, all code that uses this effect (e.g. a UI component) is also easy to test.

```ts
import {
  clearAllSimpluxMocks,
  mockEffect,
  mockMutation,
} from '@simplux/testing'

describe('loading books from the API', () => {
  afterEach(clearAllSimpluxMocks)

  it('uses the correct URL', () => {
    const mockData: Book[] = []
    const httpGetMock = jest.fn().mockReturnValue(Promise.resolve(mockData))
    mockEffect(httpGet, httpGetMock)
    mockMutation(setAll, jest.fn())

    loadBooksFromApi('Tolkien')

    expect(httpGetMock).toHaveBeenCalledWith(
      'https://my.domain.com/books?authorFilter=Tolkien',
    )
  })

  // ... see the code of this recipe for a full list of tests
})
```

And that shows you how simple it is to test your side effects with the help of **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

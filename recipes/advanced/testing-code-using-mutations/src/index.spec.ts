// this code is part of the simplux recipe "testing my code that uses mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations

import { clearAllSimpluxMocks, mockMutation } from '@simplux/testing'
import { Book, books } from './books'
import { addNewBook } from './index'

describe('adding new books', () => {
  // the best way to test our code is to test it in isolation from
  // the module; that means we do not want the mutation to be executed
  // during our test; this is where the simplux testing extension
  // comes into play: it allows us to mock a mutation
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

  // the mockMutation call above mocks our mutation indefinitely;
  // the testing extension provides a way to clear all simplux mocks
  // which we can simply do after each test
  afterEach(clearAllSimpluxMocks)

  // in specific rare situations it can be useful to manually clear
  // a mock during a test; for this the `mockMutation` function
  // returns a callback function that can be called to clear the mock
  it('sets the title and author', () => {
    const [addBookMock, clearAddBookMock] = mockMutation(books.addBook, jest.fn())

    const title = 'test title (mocked)'
    const author = 'test author (mocked)'
    addNewBook(title, author)

    expect(addBookMock).toHaveBeenCalledWith(expect.objectContaining({ title, author }))

    clearAddBookMock()

    // after clearing the mock all calls will use the original mutation;
    // note that it is usually a bad idea to call the real mutation
    // during a test like this
    const id = addNewBook('test title', 'test author')
    expect(books.state()[id].title).toBe('test title')
    books.setState({})
  })
})

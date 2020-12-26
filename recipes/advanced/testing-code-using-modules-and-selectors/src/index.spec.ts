// this code is part of the simplux recipe "testing my code that uses modules and selectors":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-modules-and-selectors

import { clearAllSimpluxMocks, mockModuleState, mockSelector } from '@simplux/testing'
import { Book, books } from './books'
import { showAllBookTitles, showBookTitle } from './index'

describe('showing book titles', () => {
  // the best way to test our code is to test it in isolation from the module;
  // that means we do not want to use the real module's state during our test;
  // this is where the simplux testing extension comes into play: it allows us
  // to mock a module's state as well as selectors
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

  // the `mockModuleState` and `mockSelector` calls above mock the state
  // and selector indefinitely; the testing extension provides a way
  // to clear all simplux mocks which we can simply do after each test
  afterEach(clearAllSimpluxMocks)

  // in specific rare situations it can be useful to manually clear a mock
  // during a test; for this the `mockModuleState` and `mockSelector`
  // functions return callback functions that can be called to clear the mocks
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
})

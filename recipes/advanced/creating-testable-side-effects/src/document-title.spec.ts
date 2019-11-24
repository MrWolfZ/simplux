// this code is part of the simplux recipe "creating testable side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-testable-side-effects

import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import {
  getDocumentTitle,
  prefixDocumentTitleWithNotificationCount,
  setDocumentTitle,
} from './document-title'

describe('document title get/set', () => {
  // to prevent the test from leaving any changes
  // behind, we save and restore the document title
  let savedTitle = ''

  beforeEach(() => {
    savedTitle = document.title
  })

  afterEach(() => {
    document.title = savedTitle
  })

  describe('getting', () => {
    it('returns the current document title', () => {
      document.title = 'test'
      expect(getDocumentTitle()).toBe('test')
    })
  })

  describe('setting', () => {
    it('set the current document title', () => {
      setDocumentTitle('test')
      expect(document.title).toBe('test')
    })
  })
})

describe('document title prefixing', () => {
  afterEach(clearAllSimpluxMocks)

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

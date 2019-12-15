// this code is part of the simplux recipe "creating testable side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-testable-side-effects

import { clearAllSimpluxMocks, mockEffect, mockMutation } from '@simplux/testing'
import { Book, books } from './books'
import { httpGet } from './http'

describe('loading books from the API', () => {
  afterEach(clearAllSimpluxMocks)

  const mockData: Book[] = [
    { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
    { id: '2', title: 'The Black Company', author: 'Glen Cook' },
    { id: '3', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
  ]

  it('uses the correct URL', () => {
    const httpGetMock = jest.fn().mockReturnValue(Promise.resolve(mockData))
    mockEffect(httpGet, httpGetMock)
    mockMutation(books.setAll, jest.fn())

    books.loadFromApi('Tolkien')

    expect(httpGetMock).toHaveBeenCalledWith('https://my.domain.com/books?authorFilter=Tolkien')
  })

  it('returns the result', async () => {
    const mockData: Book[] = []
    const httpGetMock = jest.fn().mockReturnValue(Promise.resolve(mockData))
    mockEffect(httpGet, httpGetMock)
    mockMutation(books.setAll, jest.fn())

    const result = await books.loadFromApi('Tolkien')

    expect(result).toBe(mockData)
  })

  it('sets the books', async () => {
    const httpGetMock = jest.fn().mockReturnValue(Promise.resolve(mockData))
    mockEffect(httpGet, httpGetMock)
    const [setAllMock] = mockMutation(books.setAll, jest.fn())

    await books.loadFromApi('Tolkien')

    expect(setAllMock).toHaveBeenCalledWith(mockData)
  })
})

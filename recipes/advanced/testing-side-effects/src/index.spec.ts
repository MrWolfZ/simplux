// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { loadItemsViaHttp } from './api'
import { Book, books } from './books'

describe('loading todo items', () => {
  it('calls the HTTP API', async () => {
    // since we use an effect for calling the HTTP API we can simply test
    // whether it was called inside our effect or not
    const [loadDataMock] = mockEffect(
      loadItemsViaHttp,
      jest.fn().mockReturnValue(Promise.resolve([])),
    )

    await books.loadFromApi('')

    expect(loadDataMock).toHaveBeenCalled()
  })

  it('filters out done items if requested', async () => {
    const data: Book[] = [
      { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
      { id: '2', title: 'The Black Company', author: 'Glen Cook' },
      { id: '3', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
    ]

    // to test only the filtering logic of the effect, we mock the lower-level
    // effect with the appropriate data
    mockEffect(
      loadItemsViaHttp,
      jest.fn().mockReturnValue(Promise.resolve(data)),
    )

    const result = await books.loadFromApi('J.R.R. Tolkien')

    expect(result).toEqual([data[0]])
  })

  afterEach(clearAllSimpluxMocks)
})

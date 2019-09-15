// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import { clearAllSimpluxMocks, mockEffect } from '@simplux/testing'
import { loadItemsViaHttp } from './api'
import { loadTodosFromApi, Todo } from './todos'

describe('loading todo items', () => {
  it('calls the HTTP API', async () => {
    // since we use an effect for calling the HTTP API we can simply test
    // whether it was called inside our effect or not
    const loadDataMock = jest.fn().mockReturnValue(Promise.resolve([]))
    mockEffect(loadItemsViaHttp, loadDataMock)

    await loadTodosFromApi(true)

    expect(loadDataMock).toHaveBeenCalled()
  })

  it('filters out done items if requested', async () => {
    const data: Todo[] = [
      {
        id: '1',
        description: 'clean',
        isDone: false,
      },
      {
        id: '2',
        description: 'shopping',
        isDone: true,
      },
    ]

    // to test only the filtering logic of the effect, we mock the lower-level
    // effect with the appropriate data
    const loadDataMock = jest.fn().mockReturnValue(Promise.resolve(data))
    mockEffect(loadItemsViaHttp, loadDataMock)

    const result = await loadTodosFromApi(false)

    expect(result).toEqual([data[0]])
  })

  afterEach(clearAllSimpluxMocks)
})

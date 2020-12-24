// this file contains an end-to-end test for the public API

import { getSimpluxBrowserRouter } from '@simplux/browser-router'

describe(`@simplux/browser-router`, () => {
  it('works', () => {
    const router = getSimpluxBrowserRouter()

    expect(router).toBeDefined()
  })
})

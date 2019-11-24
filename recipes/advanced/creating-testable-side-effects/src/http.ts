// this code is part of the simplux recipe "creating testable side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-testable-side-effects

import { createEffect } from '@simplux/core'

export const httpGet = createEffect(
  async <T>(url: string): Promise<T> => {
    throw new Error(
      `making GET requests is not supported; this function should only be mocked; url: ${url}`,
    )
  },
)

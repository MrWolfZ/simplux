// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import { createEffect } from '@simplux/core'
import { Book } from './books'

export const loadItemsViaHttp = createEffect(async () => {
  await new Promise(resolve => setTimeout(resolve, 200))

  return [
    { id: '1', title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
    { id: '2', title: 'The Black Company', author: 'Glen Cook' },
    { id: '3', title: 'Nineteen Eighty-Four', author: 'George Orwell' },
  ] as Book[]
})

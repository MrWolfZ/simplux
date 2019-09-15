// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import { createEffect } from '@simplux/core'
import { Todo } from './todos'

export const loadItemsViaHttp = createEffect(async () => {
  await new Promise(resolve => setTimeout(resolve, 200))

  return [
    { id: '1', description: 'go shopping', isDone: false },
    { id: '2', description: 'clean house', isDone: true },
    { id: '3', description: 'bring out trash', isDone: true },
    { id: '4', description: 'go to the gym', isDone: false },
  ] as Todo[]
})

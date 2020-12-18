// this code is part of the simplux recipe "creating testable side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/creating-testable-side-effects

import { createEffect, createEffects } from '@simplux/core'

export const { getDocumentTitle, setDocumentTitle } = createEffects({
  getDocumentTitle: () => document.title,
  setDocumentTitle: (title: string) => {
    document.title = title
  },
})

export const prefixDocumentTitleWithNotificationCount = createEffect((count: number) => {
  const currentTitle = getDocumentTitle()
  const prefixedTitle = `(${count}) ${currentTitle}`
  setDocumentTitle(prefixedTitle)
})

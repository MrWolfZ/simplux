// this code is part of the simplux recipe "testing my code that uses modules and selectors":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-modules-and-selectors

import { books } from './books'

export function showBookTitle(id: string) {
  console.log(books.titleById(id) || 'no title')
}

export function showAllBookTitles() {
  const titles = books.allTitles()
  console.log(titles.length > 0 ? titles.join(', ') : 'no titles')
}

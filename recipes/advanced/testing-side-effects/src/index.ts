// this code is part of the simplux recipe "testing my side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects

import { books } from './books'

if (document.getElementById('loadDataBtn')) {
  setupEventHandler()
} else {
  document.addEventListener('DOMContentLoaded', setupEventHandler)
}

export function setupEventHandler() {
  document
    .getElementById('loadDataBtn')!
    .addEventListener('click', async () => {
      const inputElement = document.getElementById(
        'authorFilter',
      ) as HTMLInputElement
      const value = inputElement.value

      const items = await onLoadButtonClicked(value)

      const itemList = document.getElementById('itemList') as HTMLUListElement
      let child = itemList.lastElementChild
      while (child) {
        itemList.removeChild(child)
        child = itemList.lastElementChild
      }

      for (const { id, title, author } of items) {
        const newItemElement = document.createElement('li')
        newItemElement.id = id
        newItemElement.innerHTML = `${title} by ${author}`
        itemList.appendChild(newItemElement)
      }
    })
}

export async function onLoadButtonClicked(authorFilter: string) {
  const result = await books.loadFromApi(authorFilter)
  books.setItems(result)
  return result
}

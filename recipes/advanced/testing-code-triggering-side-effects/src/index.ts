// this code is part of the simplux recipe "testing my code that triggers side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-triggering-side-effects

import { loadTodosFromApi, setTodoItems } from './todos'

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
        'includeDoneItemsCheckbox',
      ) as HTMLInputElement
      const value = inputElement.checked

      const items = await onLoadButtonClicked(value)

      const itemList = document.getElementById('itemList') as HTMLUListElement
      let child = itemList.lastElementChild
      while (child) {
        itemList.removeChild(child)
        child = itemList.lastElementChild
      }

      for (const { id, description } of items) {
        const newItemElement = document.createElement('li')
        newItemElement.id = id
        newItemElement.innerHTML = description
        itemList.appendChild(newItemElement)
      }
    })
}

// this is the code we want to test; it calls a mutation and an effect
export async function onLoadButtonClicked(includeDoneItems: boolean) {
  const todos = await loadTodosFromApi(includeDoneItems)
  setTodoItems(todos)
  return todos
}

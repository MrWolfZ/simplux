// this code is part of the simplux recipe "testing my code that uses mutations":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations

import { addTodo } from './todos'

if (document.getElementById('addItemBtn')) {
  setupEventHandler()
} else {
  document.addEventListener('DOMContentLoaded', setupEventHandler)
}

export function setupEventHandler() {
  document.getElementById('addItemBtn')!.addEventListener('click', () => {
    const inputElement = document.getElementById(
      'itemInput',
    ) as HTMLInputElement
    const value = inputElement.value

    if (!value) {
      return
    }

    inputElement.value = ''

    const id = addNewTodoItem(value)

    const itemList = document.getElementById('itemList') as HTMLElement
    const newItemElement = document.createElement('li')
    newItemElement.id = id
    newItemElement.innerHTML = value
    itemList.appendChild(newItemElement)
  })
}

// this is the code we want to test; it cannot be a mutation itself
// since it is not pure (due the random generation of the id)
export function addNewTodoItem(description: string) {
  const id = `${Math.round(Math.random() * 8999 + 1000)}`
  addTodo({ id, description })
  return id
}

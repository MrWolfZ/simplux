// this code is part of the simplux recipe "composing my selectors":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/composing-selectors

import { createSelectors, createSimpluxModule } from '@simplux/core'

// for this recipe we use a simple scenario: managing a collection
// of Todo items
interface Todo {
  id: string
  description: string
  isDone: boolean
}

interface TodoState {
  [id: string]: Todo
}

const initialState: TodoState = {
  '1': { id: '1', description: 'go shopping', isDone: false },
  '2': { id: '2', description: 'clean house', isDone: true },
  '3': { id: '3', description: 'bring out trash', isDone: true },
  '4': { id: '4', description: 'go to the gym', isDone: false },
}

const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})

// we want to select three types of things:
// 1) all items with a specific value for isDone
// 2) all items that are done
// 3) the descriptions of all done items

const { selectItemsWithIsDoneValue, selectDoneItems } = createSelectors(
  todosModule,
  {
    selectItemsWithIsDoneValue: (todos, targetIsDoneValue: boolean) =>
      Object.keys(todos)
        .map(id => todos[id])
        .filter(item => item.isDone === targetIsDoneValue),

    // instead of repeating the logic for filtering Todo items we want to
    // re-use the logic we already have, that is we want to compose our
    // selectors; to do this we can simply call the selector; however,
    // TypeScript cannot infer the return type of the selector, so we need
    // to specify it ourselves
    selectDoneItems: (todos): Todo[] => selectItemsWithIsDoneValue(todos, true),
  },
)

// alternatively to specifying the return type of a composed selector
// explicitly we can also just create it in another createSelectors
// call
const { selectDoneItemDescriptions } = createSelectors(todosModule, {
  // this selector does not need type annotations, even though it is
  // composed
  selectDoneItemDescriptions: todos =>
    selectDoneItems(todos).map(item => item.description),
})

console.log('done items:', selectDoneItems.withLatestModuleState())
console.log(
  'done item descriptions:',
  selectDoneItemDescriptions(todosModule.getState()),
)

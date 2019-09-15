// this code is part of the simplux recipe "performing side effects":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/performing-side-effects

import {
  createEffect,
  createMutations,
  createSimpluxModule,
} from '@simplux/core'

// for this recipe we use a simple scenario: loading data from an API
interface Todo {
  id: string
  description: string
  isDone: boolean
}

interface TodoState {
  [id: string]: Todo
}

const initialState: TodoState = {}

const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})

const { setItems } = createMutations(todosModule, {
  setItems(state, items: Todo[]) {
    for (const id of Object.keys(state)) {
      delete state[id]
    }

    for (const item of items) {
      state[item.id] = item
    }
  },
})

// the function below simulates calling our API
async function loadTodosFromApi(isDoneFilter?: boolean) {
  await new Promise(resolve => setTimeout(resolve, 200))

  const todos = [
    { id: '1', description: 'go shopping', isDone: false },
    { id: '2', description: 'clean house', isDone: true },
    { id: '3', description: 'bring out trash', isDone: true },
    { id: '4', description: 'go to the gym', isDone: false },
  ] as Todo[]

  return isDoneFilter === undefined
    ? todos
    : todos.filter(t => t.isDone === isDoneFilter)
}

// we can now simply call our data load function and populate the module
loadTodosFromApi()
  .then(setItems)
  .then(() => {
    console.log('items:', todosModule.getState())
  })

// while this works, it has a major downside: it is difficult to test;
// simplux provides a `createEffect` function that solves this problem
// by wrapping your side-effectful code in order to allow mocking it
// during testing
const loadTodosFromApiEffect = createEffect(loadTodosFromApi)

// the effect has the exact same signature as your original code;
// how and where you would perform this call in a real application
// depends on your tech stack and architecture (e.g. in a React
// application you might perform this call in a `useEffect` hook)
loadTodosFromApiEffect(false)
  .then(setItems)
  .then(() => {
    console.log('items:', todosModule.getState())
  })

// this concludes this recipe; for details on how to mock effects during
// testing see the recipe for "testing my code that triggers side effects"

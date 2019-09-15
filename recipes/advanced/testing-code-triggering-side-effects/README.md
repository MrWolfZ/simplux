# Recipe: testing my code that triggers side effects

This recipe shows you how simple it is to test your code that triggers side effects with **simplux**.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe. The recipe for [performing side effects](../performing-side-effects#readme) is also important for following this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-triggering-side-effects).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/testing redux -S
```

Now we're ready to go.

For this recipe we use a simple scenario: loading data from an API. Let's create a module for this.

```ts
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

const { setTodoItems } = createMutations(todosModule, {
  setTodoItems(state, items: Todo[]) {
    for (const id of Object.keys(state)) {
      delete state[id]
    }

    for (const item of items) {
      state[item.id] = item
    }
  },
})

// this effect simulates calling our API
const loadTodosFromApi = createEffect(async (includeDoneItems: boolean) => {
  await new Promise(resolve => setTimeout(resolve, 200))

  const todos = [
    { id: '1', description: 'go shopping', isDone: false },
    { id: '2', description: 'clean house', isDone: true },
    { id: '3', description: 'bring out trash', isDone: true },
    { id: '4', description: 'go to the gym', isDone: false },
  ] as Todo[]

  return todos.filter(t => !t.isDone || includeDoneItems)
})
```

In our application code we want to load the todo items when a button is clicked. There is also a checkbox to determine whether the todo items should be filtered.

```ts
async function onLoadButtonClicked(includeDoneItems: boolean) {
  const todos = await loadTodosFromApi(includeDoneItems)
  setTodoItems(todos)
  return todos
}
```

This is the code we are going to test.

The best way to test our code is to test it in isolation from the module. That means we do not want the effect (or the mutation) to be executed during our test. This is where the **simplux** testing extension comes into play: it allows us to mock an effect.

```ts
import { mockEffect, mockMutation } from '@simplux/testing'

it('loads data with correct filter', async () => {
  const loadDataMock = jest.fn().mockReturnValue(Promise.resolve([]))

  // after this line all invocations of the effect will be
  // redirected to the provided mock function
  mockEffect(loadTodosFromApi, loadDataMock)

  // we also mock the mutation that is called in our handler;
  // see the recipe for "testing my code that uses mutations"
  // for more details on this
  mockMutation(setTodoItems, jest.fn())

  await onLoadButtonClicked(true)

  expect(loadDataMock).toHaveBeenCalledWith(true)
})
```

The `mockEffect` call above mocks our mutation indefinitely. The testing extension provides a way to clear all simplux mocks which we can simply do after each test.

```ts
import { clearAllSimpluxMocks } from '@simplux/testing'

afterEach(clearAllSimpluxMocks)
```

In specific rare situations it can be useful to manually clear a mock during a test. For this the `mockEffect` function returns a callback function that can be called to clear the mock.

```ts
it('sets the loaded items in the module', async () => {
  const data: Todo[] = [
    {
      id: '1',
      description: 'clean',
      isDone: false,
    },
  ]

  const loadDataMock = jest.fn().mockReturnValue(Promise.resolve(data))
  const setTodoItemsMock = jest.fn()

  const clearLoadDataMock = mockEffect(loadTodosFromApi, loadDataMock)
  mockMutation(setTodoItems, setTodoItemsMock)

  await onLoadButtonClicked(true)

  // clear the mock explicitly
  clearLoadDataMock()

  // do something that requires the mock to be cleared

  expect(setTodoItemsMock).toHaveBeenCalledWith(data)
})
```

And that is all you need to test your code that uses **simplux** effects.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

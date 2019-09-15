# Recipe: performing side effects

This recipe shows how simple it is to perform side effects (like loading data from your API) with **simplux**.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/performing-side-effects).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core redux -S
```

Now we're ready to go.

For this recipe we use a common scenario: loading data from an API. Let's create a module with some mutations for this.

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
```

For this recipe we simulate loading the data from our API. In a real application you would probably perform an HTTP call for this.

```ts
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
```

We can now use this function to populate our module.

> How and where you would perform this call in a real application depends on your tech stack and architecture (e.g. in a React application you might perform this call in a `useEffect` hook)

```ts
loadTodosFromApi().then(setItems)
```

While this works, it has a major downside: it is difficult to test code that calls functions like this. **simplux** provides a `createEffect` function that solves this problem by wrapping your side-effectful code in order to allow mocking it during testing.

```ts
const loadTodosFromApiEffect = createEffect(loadTodosFromApi)
```

The created effect has the exact same signature as your original code and outside of testing it will simply forward the call to your function.

```ts
loadTodosFromApiEffect(false).then(setItems)
```

This concludes this recipe. We strongly recommend you read the recipe for [testing your code that triggers side effects](../testing-code-triggering-side-effects#readme) as well as the recipe for [testing side effects](../testing-side-effects#readme) to get to know the full benefits of using **simplux** for your side effects.

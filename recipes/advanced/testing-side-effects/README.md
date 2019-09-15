# Recipe: testing side effects

This recipe gives you some advice on how to test your side effects (like loading data from your API).

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe. The recipe for [performing side effects](../performing-side-effects#readme) is also important for following this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/testing-side-effects).

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
```

We want to load the todo items from our API. As we learned in the recipe for [performing side effects](../performing-side-effects#readme) we can create an effect for this.

```ts
// this effect first calls an HTTP API and then performs some post-processing
// on the client (in a typical application this post processing would most
// likely already be done in the API but it serves as a good example for this
// recipe)
const loadTodosFromApi = createEffect(async (includeDoneItems: boolean) => {
  await loadItemsViaHttp() // to be implemented, see below

  // do some post processing
  return todos.filter(t => !t.isDone || includeDoneItems)
})
```

How are we going to test this and what exactly are we even testing here? There are two parts: 1) the call to the HTTP API, and 2) the post processing logic. 2) is the real logic that we should test and 1) is something that we certainly do not want to execute during our test, so we should mock it. Depending on your tech stack the library you use for making HTTP calls probably already provides a way to mock HTTP calls, in which case we recommend you use that library's testing capabilities. However, alternatively we could (and I am sure you have already guessed this) just make `loadItemsViaHttp` an effect itself.

```ts
const loadItemsViaHttp = createEffect(async () => {
  // call the API
})
```

This way we can use **simplux**'s mocking capabilities to mock this call. If you go this route you could also create lower-level generic effects for HTTP calls, e.g. for `GET` calls:

```ts
const get = createEffect(async (url: string) => {
  // call the API
})
```

Once we have 1) mocked we can easily test the post-processing logic from 2) by simply calling the `loadTodosFromApi`.

> There are alternative designs to the effect above that would allow testing the filtering logic without the effect, e.g. by extracting it into a separate function. How you want to structure your effects is completely up to you.

And that how simple it is to test your side effects with the help of **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

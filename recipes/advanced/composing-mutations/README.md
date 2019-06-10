# Recipe: composing mutations

This recipe shows you how simple it is to compose/re-use your **simplux** mutations.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/composing-mutations).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/immer redux immer -S
```

We are going to use the immer extension for this recipe to make our mutations simpler. If you are unfamiliar with it, the recipe for [simplifying state changes](../../basics/simplifying-state-changes#readme) will tell you everything you need to know.

Now we're ready to go.

For this recipe we use a simple scenario: managing a collection of Todo items. Let's create a module for this.

```ts
interface Todo {
  id: string
  description: string
  isDone: boolean
}

interface TodoState {
  todosById: { [id: string]: Todo }
  todoIds: string[]
}

const initialState: TodoState = {
  todosById: {},
  todoIds: [],
}

const { createMutations } = createSimpluxModule({
  name: 'todos',
  initialState,
})
```

We want to create two mutations for this module: one for adding a single Todo item, and another one for adding multiple items at once. However, instead of duplicating the logic for adding an item we want to re-use the mutation for adding a single item inside the mutation that adds multiple items. That means we want to compose our two mutations. Let's see how we can do this.

```ts
const { addTodo, addMultipleTodos } = createMutations({
  addTodo({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },

  // to re-use a mutation we can simply call it with the state
  addMultipleTodos(state, todos: Todo[]) {
    todos.forEach(t => addTodo.withState(state)(t))
  },
})
```

We can also do the same with the default immutable style of writing mutations, but for this we need to create the mutation/ separately to allow TypeScript to properly infer all types.

```ts
const { addMultipleTodosDefaultStyle } = createMutations({
  addMultipleTodosDefaultStyle(state, todos: Todo[]) {
    return todos.reduce((s, t) => addTodo.withState(s)(t), state)
  },
})
```

Now we can use our mutations to add Todo items.

```ts
console.log(
  'added multiple Todo items:',
  addMultipleTodos([
    { id: '1', description: 'go shopping', isDone: false },
    { id: '2', description: 'clean house', isDone: false },
  ]),
)

console.log(
  'added multiple Todo items default style:',
  addMultipleTodosDefaultStyle([
    { id: '3', description: 'bring out trash', isDone: false },
    { id: '4', description: 'go to the gym', isDone: false },
  ]),
)
```

And that is all you need for composing your mutations with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

# Recipe: composing my mutations

This recipe shows you how simple it is to compose/re-use your **simplux** mutations.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/composing-mutations).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core redux -S
```

Now we're ready to go.

For this recipe we use a simple scenario: managing a collection of Todo items. Let's create a module for this.

```ts
import { createSimpluxModule } from '@simplux/core'

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

const todosModule = createSimpluxModule({
  name: 'todos',
  initialState,
})
```

We want to create two mutations for this module: one for adding a single Todo item, and another one for adding multiple items at once. However, instead of duplicating the logic for adding an item we want to re-use the mutation for adding a single item inside the mutation that adds multiple items. That means we want to compose our two mutations. Let's see how we can do this.

```ts
import { createMutations } from '@simplux/core'

const { addTodo, addMultipleTodos } = createMutations(todosModule, {
  addTodo({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },

  // to re-use a mutation we can simply call it with the state
  addMultipleTodos(state, todos: Todo[]) {
    const addTodoWithState = addTodo.withState(state)
    todos.forEach(addTodoWithState)
  },
})
```

Now we can use our mutations to add Todo items.

```ts
console.log(
  'added single Todo item:',
  addTodo({ id: '1', description: 'go shopping', isDone: false }),
)

console.log(
  'added multiple Todo items:',
  addMultipleTodos([
    { id: '2', description: 'clean house', isDone: false },
    { id: '3', description: 'go to the gym', isDone: false },
  ]),
)
```

And that is all you need for composing your mutations with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

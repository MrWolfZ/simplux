# Recipe: simplifying state changes

This recipe shows you how you can make your state changes simpler with less boilerplate while keeping the benefits of immutability.

If you are new to **simplux** there is [a recipe](../getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/simplifying-state-changes).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/immer redux -S
```

We also need to activate the immer extension by importing the package. The immer extension allows us to write our mutations in a "mutable" style (we'll see what that means in a second). It is recommended to place this import in the root file of your application.

```ts
// this import registers the simplux immer extension
import '@simplux/immer'
```

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

Let's create a mutation that adds an item to our collection.

```ts
const { addTodo } = createMutations({
  addTodo({ todosById, todoIds }, todo: Todo) {
    return {
      todosById: { ...todosById, [todo.id]: todo },
      todoIds: [...todoIds, todo.id],
    }
  },
})
```

I think you can agree that it feels a bit cumbersome having to manually copy the `todosById` object and `todoIds` array to add items to them. It gets even worse if we want to update a nested object. Let's add a mutation for marking an item as done.

```ts
const { addTodo } = createMutations({
  markTodoAsDone(state, todoId: string) {
    return {
      ...state,
      todosById: {
        ...state.todosById,
        [todoId]: { ...state.todosById[todoId], isDone: true },
      },
    }
  },
})
```

We do all of this to ensure that our state updates are immutable, which helps prevent difficult to detect bugs and side-effects. Wouldn't it be great if there was a way to keep these benefits while writing normal mutating JavaScript code? The immer extension allows us to do exactly that by leveraging [immer](https://github.com/immerjs/immer). With this extension active each mutation is wrapped in a `produce` call, which allows us to write code as we normally would.

Let's see how adding an item this way works.

```ts
const { addTodoSimpler } = createMutations({
  addTodoSimpler({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },
})
```

This looks much nicer already, doesn't it? Things get even better when we try to update a nested object.

```ts
const { addTodoSimpler } = createMutations({
  markTodoAsDoneSimpler({ todosById }, todoId: string) {
    todosById[todoId].isDone = true
  },
})
```

If we call these mutations, the initial state still remains unchanged.

```ts
console.log(
  'added Todo item:',
  addTodoSimpler({ id: '1', description: 'go shopping', isDone: false }),
)

console.log('mark Todo item as done:', markTodoAsDoneSimpler('1'))

console.log('unchanged initial state:', initialState)
```

And that is all you need to simplify your state changes with **simplux**.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

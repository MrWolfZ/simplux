# Recipe: creating non-trivial modules

This recipe shows you how you can create **simplux** modules that are as non-trivial as the modules you will typically create in your application.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/creating-non-trivial-modules).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/selectors redux -S
```

Now we're ready to go.

For this recipe we use a common scenario: managing a collection of entities, specifically Todo items. Let's create our module. For non-trivial modules like this we recommend to create explicit interfaces for the state instead of having the type of state inferred from the initial state value. This makes testing the module simpler as well as making type signatures for mutations and selectors more clean.

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

const getTodosState = todosModule.getState
```

For updating our collection of entities we need mutations for adding and removing items. **simplux** allows us to write these mutations with normal mutating JavaScript code while still keeping all the state updates immutable and simple to test (this is achieved by leveraging [immer](https://github.com/immerjs/immer)). However, if you prefer a more explicit immutable style you can also manually copy the object and return the updated copy instead.

```ts
import { createMutations } from '@simplux/core'

const { addTodo, addTodos, removeTodoById } = createMutations(todosModule, {
  addTodo({ todosById, todoIds }, todo: Todo) {
    todosById[todo.id] = todo
    todoIds.push(todo.id)
  },

  addTodos(state, ...todos: Todo[]) {
    // see the recipe for "composing my mutations" for more details about
    // this style of writing mutations
    todos.forEach(t => addTodo.withState(state)(t))
  },

  // it is recommended to code defensively, i.e. to check
  // if an item exists before trying to remove it
  removeTodoById({ todosById, todoIds }, id: string) {
    const idx = todoIds.indexOf(id)
    if (idx >= 0) {
      delete todosById[id]
      todoIds.splice(idx, 1)
    }
  },
})
```

Let's also create a mutation for marking an item as done. This shows how simple it is to update nested objects.

```ts
const { markTodoAsDone } = createMutations(todosModule, {
  // once again we check defensively if the item exists; alternatively
  // we could also throw an Error, depending on your requirements
  markTodoAsDone({ todosById }, todoId: string) {
    if (!todosById[todoId]) {
      return
    }

    todosById[todoId].isDone = true
  },
})
```

Now that we have a way to update our collection of Todo items we need a way to access the collection in a structured way. For this we create selectors (see [this recipe](../../basics/computing-derived-state#readme) if you are unfamilar with selectors).

```ts
import { createSelectors } from '@simplux/selectors'

const {
  selectTodoIds,
  selectNumberOfTodos,
  selectAllTodos,
  selectPendingTodos,
  selectTodoById,
} = createSelectors(todosModule, {
  // optionally we can explicitly annotate the function with a return
  // type that indicates the value is readonly to prevent accidental
  // direct mutations of the returned value
  selectTodoIds: ({ todoIds }): readonly string[] => todoIds,

  selectNumberOfTodos: ({ todoIds }) => todoIds.length,

  selectAllTodos: ({ todoIds, todosById }) => todoIds.map(id => todosById[id]),

  // see the recipe for "composing my selectors" for more details about
  // this style of writing selectors
  selectPendingTodos: (state): Todo[] =>
    selectAllTodos(state).filter(t => !t.isDone),

  // we use an explicit type annotation to express that the accessed
  // Todo item might not exists, which allows TypeScript to prevent
  // bugs in strict mode
  selectTodoById: ({ todosById }, id: string): Todo | undefined =>
    todosById[id],
})
```

We can now use our module.

```ts
console.log(
  'add single Todo:',
  addTodo({ id: '1', description: 'go shopping', isDone: false }),
)

console.log('number of Todos:', selectNumberOfTodos(getTodosState()))

console.log(
  'add multiple Todos:',
  addTodos(
    { id: '2', description: 'clean house', isDone: false },
    { id: '3', description: 'work out', isDone: false },
  ),
)

console.log('mark Todo item as done:', markTodoAsDone('2'))

console.log('pending todos:', selectPendingTodos.withLatestModuleState())

console.log('todo 3:', selectTodoById.withLatestModuleState('3'))
```

In the [code for this recipe](src/todos) you can see the recommended way of structuring your module into multiple files. Keeping the module, its mutations, and its selectors in separate files helps making each of them easier to understand. The same applies to the tests for which we have one file for each. In addition, all those files are placed in a single folder that represents the whole module to clearly separate it from its surrounding code.

> The file structure from this recipe is only a recommendation and there are other ways for structuring your modules that work as well. Regardless of the structure you choose in your application it is important to agree with your team on a common structure and apply it consistently everywhere.

We hope this recipe could give you some pointers for how you can create non-trivial **simplux** modules in your application.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

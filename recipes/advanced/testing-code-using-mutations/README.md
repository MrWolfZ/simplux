# Recipe: testing my code that uses mutations

This recipe shows you how simple it is to test your code that uses **simplux** mutations.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/testing-code-using-mutations).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/core-testing redux -S
```

We also need to activate the core-testing extension by importing the package. You need add this import once globally with the mechanism your test framework provides before any tests are run (e.g. [Jest](https://jestjs.io/) allows you to configure `setupFiles` where you can place this import).

```ts
import '@simplux/core-testing'
```

Now we're ready to go.

For this recipe we use a simple scenario: managing a collection of Todo items. Let's create a module for this.

```ts
interface Todo {
  id: string
  description: string
}

interface TodoState {
  [id: string]: Todo
}

const initialState: TodoState = {}

const { createMutations, getState } = createSimpluxModule({
  name: 'todos',
  initialState,
})

const getTodos = getState

const { addTodo } = createMutations({
  addTodo(todosById, todo: Todo) {
    return {
      ...todosById,
      [todo.id]: todo,
    }
  },
})
```

In our application code we want to create a new Todo item with a random 4 character id.

```ts
function addNewTodoItem(description: string) {
  const id = `${Math.round(Math.random() * 8999 + 1000)}`
  addTodo({ id, description })
  return id
}
```

This is the code we are going to test.

> You may think that `addNewTodoItem` could be a mutation itself, but it must not be since it is not pure (due the random generation of the id).

One possible way to test your code that uses mutations is to just let it call the mutation normally and then check the module's state to see if the mutation was correctly applied. This is more of an integration style of testing that verifies everything works together.

```ts
it('uses the value as description', () => {
  const id = addNewTodoItem('test item')
  expect(getTodos()[id].description).toBe('test item')
})
```

However, usually it is better to test only your code without executing the mutation. This is where the core-testing extension comes into play. It allows us to mock a mutation.

```ts
import { mockMutation } from '@simplux/core-testing'

it('generates a 4 character ID', () => {
  const addTodoSpy = mockMutation(addTodo, jest.fn())

  addNewTodoItem('test item')

  expect(addTodoSpy).toHaveBeenCalled()
  expect((addTodoSpy.mock.calls[0][0] as Todo).id.length).toBe(4)
})
```

The code above indefinitely mocks the mutation. It is recommended to remove the mock after each test and create a new mock in each test.

```ts
import {
  removeMutationMock,
  removeAllMutationMocks,
} from '@simplux/core-testing'

afterEach(() => {
  // we can remove the mock for a single mutation
  removeMutationMock(addTodo)

  // alternatively we can also just remove all mocks
  removeAllMutationMocks()
})
```

Since this a bit cumbersome to do for every test and mutation, the `mock` function allows specifying the number of times the mutation should be mocked before the mock is automatically removed. Since it is such a common scenario to mock a mutation just once there is also an explicit `mockOnce` function that only mocks the next invocation of the mutation.

```ts
import { mockMutationOnce } from '@simplux/core-testing'

it('uses the value as description (mocked once)', () => {
  const addTodoSpy = mockMutationOnce(addTodo, jest.fn())

  const description = 'test item (mocked)'
  addNewTodoItem(description)

  expect(addTodoSpy).toHaveBeenCalledWith(
    expect.objectContaining({ description }),
  )

  // all calls after the first will use the original mutation
  const id = addNewTodoItem('test item')
  expect(getTodos()[id].description).toBe('test item')
})
```

And that is all you need to test your code that uses **simplux** mutations.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

# Recipe: composing selectors

This recipe shows you how simple it is to compose/re-use your **simplux** selectors.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe. The recipe for [computing derived state](../../basics/computing-derived-state#readme) is also helpful for following this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/composing-selectors).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core @simplux/selectors redux -S
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
  [id: string]: Todo
}

const initialState: TodoState = {
  '1': { id: '1', description: 'go shopping', isDone: false },
  '2': { id: '2', description: 'clean house', isDone: true },
  '3': { id: '3', description: 'bring out trash', isDone: true },
  '4': { id: '4', description: 'go to the gym', isDone: false },
}

const { getState, createSelectors } = createSimpluxModule({
  name: 'todos',
  initialState,
})
```

We want to select three types of things for this module:

1. all items with a specific value for `isDone`
2. all items that are done
3. the descriptions of all done items

However, instead of duplicating the logic for filtering Todo items we want to re-use our logic. That means we want to compose our selectors. To do this, we can simply call any other selector we require. Let's see how we can do this to select all items that are done.

```ts
const { selectItemsWithIsDoneValue, selectDoneItems } = createSelectors({
  selectItemsWithIsDoneValue: (todos, targetIsDoneValue: boolean) =>
    Object.values(todos).filter(item => item.isDone === targetIsDoneValue),

  // sadly, TypeScript cannot infer the return type of the
  // selector, so we need to specify it ourselves
  selectDoneItems: (todos): Todo[] => selectItemsWithIsDoneValue(todos, true),
})
```

Instead of adding type annotations to our composed selectors, we can also create them in a separate `createSelectors` call, which allows TypeScript to properly infer all types. Let's do this for our last selector.

```ts
const { selectDoneItemDescriptions } = createSelectors({
  selectDoneItemDescriptions: todos =>
    selectDoneItems(todos).map(item => item.description),
})
```

We can call our composed selectors like any other selector.

```ts
console.log('done items:', selectDoneItems.withLatestModuleState())
console.log('done item descriptions:', selectDoneItemDescriptions(getState()))
```

And that is all you need for composing your selectors with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

# Recipe: using **simplux** in my application that already uses Redux

This recipe shows you how simple it is to integrate **simplux** into your application that is already using [Redux](https://redux.js.org/).

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/using-in-redux-application).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core redux -S
```

Now we're ready to go.

For this recipe we assume we have a very simple existing application that uses redux to manage a counter. In your application this setup is probably quite a bit more complex with many more reducers, middlewares and such. All of these things do not affect **simplux**, so you can keep them just as they are.

```ts
import { combineReducers, createStore, Reducer } from 'redux'

const counterReducer: Reducer<number> = (c = 0, { type }) =>
  type === 'INC' ? c + 1 : c

const rootReducer = combineReducers({
  counter: counterReducer,
})

const store = createStore(rootReducer)
```

**simplux** is built on top of Redux. However, instead of wrapping Redux it is designed to seamlessly compose with it. To achieve this **simplux** exports its root reducer which you can place anywhere in your reducer hierarchy. Therefore, we only need to make a slight adjustment to the store setup above.

```ts
import { getSimpluxReducer } from '@simplux/core'

const rootReducer = combineReducers({
  counter: counterReducer,

  // this key can be anything, but it is recommended to name the
  // slice of state that simplux is responsible for "simplux"
  simplux: getSimpluxReducer(),
})
```

Now there is only one more step that is required. We need to let **simplux** know about our new store.

```ts
import { setReduxStoreForSimplux } from '@simplux/core'

setReduxStoreForSimplux(
  store,

  // this second parameter tells simplux where in the state it
  // can find its slice
  s => s.simplux,
)
```

Now we can start creating modules.

```ts
const { getState } = createSimpluxModule({
  name: 'mySimpluxModule',
  initialState: {
    value: 'mySimpluxState',
  },
})

console.log('my module state:', getState())
console.log('full redux state:', store.getState())
```

And that is all you need to use **simplux** in your application that already uses Redux.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

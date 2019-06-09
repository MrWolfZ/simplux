# Recipe: debugging with Redux DevTools

This recipe shows you how simple it is to debug your state changes with **simplux** by leveraging the [Redux DevTools](https://github.com/reduxjs/redux-devtools).

This recipe requires that you use an explicit Redux store. There is [a recipe](../using-in-redux-application#readme) that shows you how to do that, so we recommend you follow that recipe first.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/debugging-with-redux-devtools).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core redux -S
npm i redux-devtools-extension -D
```

Now we're ready to go.

Setting up the Redux DevTools with **simplux** is done exactly the same way as for any normal Redux application. That means we need to have a Redux store. Therefore, if you haven't done so, follow [this recipe](../using-in-redux-application#readme) to learn how to use **simplux** with a custom redux store.

This recipe uses the DevTools extension, meaning you need to install the [browser extension](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en). Then, when creating the Redux store, you need to compose it with the DevTools extension.

```ts
import { getSimpluxReducer, setReduxStoreForSimplux } from '@simplux/core'
import { combineReducers, createStore } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'

const rootReducer = combineReducers({
  simplux: getSimpluxReducer(),
})

const store = createStore(rootReducer, composeWithDevTools())

setReduxStoreForSimplux(store, s => s.simplux)
```

Now, when we create a **simplux** module and call its mutations we can see them in the DevTools.

```ts
import { createSimpluxModule } from '@simplux/core'

const { createMutations } = createSimpluxModule({
  name: 'counter',
  initialState: 0,
})

const { increment } = createMutations({
  increment: c => c + 1,
})

console.log('incremented counter:', increment())
```

![alt text](DevTools.png 'DevTools')

And that is all you need to use the Redux DevTools with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

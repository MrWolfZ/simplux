# Recipe: getting started

This recipe shows how simple it is to get started using **simplux**.

> You can try out this recipe through this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/getting-started).

For this recipe, you need to have **simplux**'s _core_ package installed. In addition, we need to install [redux](https://redux.js.org/).

```sh
npm i @simplux/core redux -S
```

**simplux** is built to work with [redux](https://redux.js.org/). If you are not yet using redux, **simplux** will take care of everything for you. However, if you are working on an existing application, you may already have a redux store. In that case, once you have finished this recipe, the recipe for [using **simplux** with an application that already uses redux](../using-simplux-with-application-already-using-redux#readme) will show you how to achieve that.

Now let's start using **simplux**.

In **simplux** all state is contained in _modules_. Your application will consist of many such modules, but for now we will only create a simple one that contains a counter. Once you have finished this recipe, you can head over to the recipe for [organizing your application state](../organizing-my-application-state#readme) to get more insights into how to do that effectively.

```ts
import { createSimpluxModule } from '@simplux/core'

// here we create our first simple counter module
const counterModule = createSimpluxModule({
  // this name uniquely identifies our module
  name: 'counter',

  // this value determines the shape of our state
  initialState: {
    counter: 0,
  },
})

// the simplest operation of a module is to get its state
console.log('initial state:', counterModule.getState())
```

The most interesting thing you can do with state is to change it. In **simplux** that is done with mutations. A mutation is a pure function that takes the current module state - and optionally some additional arguments - and returns a new updated state. So, in contrast to their name, mutations do not really mutate the state but create a modified copy.

```ts
// to change the state, we can define mutations
const { increment, incrementBy } = counterModule.createMutations({
  // we can have mutations that only use the state
  increment: state => ({ ...state, counter: state.counter + 1 }),

  // our mutations can also have arguments
  incrementBy: (state, amount: number) => ({
    ...state,
    counter: state.counter + amount,
  }),
})

// to update the module state, simply call a mutation (this
// dispatches a redux action internally)
increment()
console.log('incremented counter:', counterModule.getState())

// we can also pass arguments to a mutation
incrementBy(5)
console.log('incremented counter by 5:', counterModule.getState())

// executing a mutation returns the updated state
console.log('final state:', increment())
```

> If you find this style of writing mutations a bit cumbersome, you are not alone. The recipe for [changing state](../changing-state#readme) will show you an alternative simpler way of writing mutations.

And that is all you need to start using **simplux**. You may have noticed that in all of this code, there is only a single type annotation (for the `amount` parameter of the `incrementBy` mutation). This is intentional, since **simplux** is designed to require the absolute minimal amount of type annotations by leveraging type inference wherever possible while still being perfectly type-safe.

By now you are certainly curious how **simplux** can help you in more complex scenarios. Our [other recipes](../../../../..#recipes) are an excellent starting point for this.

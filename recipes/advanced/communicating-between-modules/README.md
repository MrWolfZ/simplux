# Recipe: communicating between modules

This recipe shows you how simple it is to communicate between your **simplux** modules.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/communicating-between-modules).

Before we start let's install **simplux**.

```sh
npm i @simplux/core -S
```

Now we're ready to go.

In your application you will sometimes face situations where one module must be updated when another module changes. Let's look at one such situation, where we have a `user` module to manage information about the logged in user and a `notifications` module that contains notifications for the logged in user. In this scenario we want to clear the notifications when the user logs out.

> Note that there are alternative designs that do not require the modules to communicate, e.g. by placing the notifications in the `user` module instead of keeping them separate. It all depends on your application's needs. As a general recommendation, try to keep the communication between your modules to a minimum. If you find yourself in a situation where you want two or more modules to communicate with each other consider if you can restructure your modules so that everything that needs to change together lives in the same module (although this will not always be possible).

Let's start by creating our two modules.

```ts
interface UserState {
  isLoggedIn: boolean
  authToken: string | undefined
}

const userModule = createSimpluxModule<UserState>('user', {
  isLoggedIn: false,
  authToken: undefined,
})

const user = {
  ...userModule,
  ...createMutations(userModule, {
    logIn(state, authToken: string) {
      state.isLoggedIn = true
      state.authToken = authToken
    },

    logOut(state) {
      state.isLoggedIn = false
      state.authToken = undefined
    },
  }),
}

interface Notification {
  description: string
  isMarkedAsSeen: boolean
}

const notificationsModule = createSimpluxModule<Notification[]>('notifications', [])

const notifications = {
  ...notificationsModule,
  ...createMutations(notificationsModule, {
    add(state, notification: Notification) {
      state.push(notification)
    },

    // note that mutations can return a new state instead of
    // updating it which can be useful in situations like this
    clear: () => [],
  }),
}
```

So how do we clear the notifications when the user logs out? If you have read the recipe for [reacting to state changes](../reacting-to-state-changes#readme) you probably already know how to do this (otherwise we recommend you to read it). What we want to do is to subscribe to state changes of the `user` module and in the state change handler we will clear the `notifications` module if the user logged out.

```ts
const { unsubscribe } = user.subscribeToStateChanges(({ isLoggedIn }, previousState) => {
  const userHasLoggedOut = !isLoggedIn && previousState.isLoggedIn

  if (userHasLoggedOut) {
    notifications.clear()
  }
})
```

With this the notifications be will cleared once the user logs out.

```ts
user.logIn('authToken')

notifications.add({
  description: 'simplux makes your life simple',
  isMarkedAsSeen: false,
})

console.log('notifications:', notifications.getState())

user.logOut()

console.log('notifications after user logged out:', notifications.getState())

// don't forget to unsubscribe when you do not need to react to
// state changes anymore (although in this scenario it may make
// sense for the subscription to live indefinitely)
unsubscribe()
```

And that is all you need for communicating between your **simplux** modules.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

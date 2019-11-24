# Recipe: reacting to state changes

This recipe shows you how simple it is to react to changes in your state with **simplux**.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/advanced/reacting-to-state-changes).

Before we start let's install all the packages we need.

```sh
npm i @simplux/core redux -S
```

Now we're ready to go.

For this recipe we use a common scenario: managing a logged in user. Let's create a module with some mutations for this.

```ts
interface UserState {
  isLoggedIn: boolean
  iconUrl: string | undefined
  authToken: string | undefined
}

const initialState: UserState = {
  isLoggedIn: false,
  iconUrl: undefined,
  authToken: undefined,
}

const userModule = createSimpluxModule({
  name: 'user',
  initialState,
})

// let's create a couple of basic mutations: for logging in and
// logging out as well as for updating the user's icon URL

const userMutations = createMutations(userModule, {
  logIn(state, authToken: string, icon: string) {
    state.isLoggedIn = true
    state.authToken = authToken
    state.icon = icon
  },

  logOut(state) {
    state.isLoggedIn = false
    state.authToken = undefined
    state.icon = undefined
  },

  setIcon(state, icon: string) {
    state.icon = icon
  },
})

const user = {
  ...userModule,
  ...userMutations,
}
```

Our typical use case for reacting to state changes is redirecting the user to a different page after they sign out.

> In this recipe we only log a message, but in a real application you would perform a navigation based on whatever rendering framework or library you are using.

A **simplux** module provides a `subscribeToStateChanges` function to register a handler to be called whenever the module's state changes. By default the handler will also be called with the module's current state immediately after subscribing (this can be configured through the optional second options parameter).

```ts
// the subscribeToStateChanges function returns an object with an
// unsubscribe callback that can be used to unsubscribe from state
// changes
const { unsubscribe } = user.subscribeToStateChanges(state => {
  console.log('state changed:', state)
})
```

This handler will be executed for every state change. However, often you do not want to react to all changes to a module's state, but only to specific changes inside the module. `subscribeToStateChanges` allows this by providing the previous state as the second parameter to the handler. This allows you to compare any nested fields to determine whether the state change is relevant for your handler.

```ts
const { handler } = user.subscribeToStateChanges(
  ({ isLoggedIn }, previousState) => {
    // we can check for changes of specific properties
    const isLoggedInChanged = isLoggedIn !== previousState.isLoggedIn

    if (isLoggedInChanged) {
      console.log(
        isLoggedIn ? 'User logged in.' : 'User logged out. Redirecting...',
      )
    }
  },
)

// to make the state change handler simple to test without needing
// to create a separate function for it (which would require manual
// type annotations) simplux returns the handler from the subscribe
// call; during tests you can then simply call the handler directly
handler(initialState, initialState)
```

> If you want to ignore the first invocation of the handler when subscribing pass `{ shouldSkipInitialInvocation: true }` as the second argument to `subscribeToStateChanges`.

If you are already using [RxJS](https://www.learnrxjs.io/) in your application (or simply like using it) you can create an observable of state changes.

```ts
import { Observable } from 'rxjs'

const observeUserState = () =>
  new Observable<UserState>(sub =>
    user.subscribeToStateChanges(state => sub.next(state)),
  )

const rxjsSubscription = observeUserState().subscribe(state => {
  console.log('observed state with RxJS:', state)
})
```

Now let's play through a scenario of the user logging in, then changing their icon and finally logging out, and see how our reactions are called. We also unsubscribe from certain change handlers in between some of the changes.

```ts
user.logIn('authToken', 'http://my.domain.com/userIcon')

rxjsSubscription.unsubscribe()

user.setIcon('http://my.domain.com/updatedUserIcon')

unsubscribe()

user.logOut()
```

This leads to the following console output. The first two lines are due to the initial invocation of the handler with the current state of the module.

```
state changed: {isLoggedIn: false, iconUrl: undefined, authToken: undefined}
observed state with RxJS: {isLoggedIn: false, iconUrl: undefined, authToken: undefined}
state changed: {isLoggedIn: true, iconUrl: "http://my.domain.com/userIcon", authToken: "authToken"}
User logged in.
observed state with RxJS: {isLoggedIn: true, iconUrl: "http://my.domain.com/userIcon", authToken: "authToken"}
state changed: {isLoggedIn: true, iconUrl: "http://my.domain.com/updatedUserIcon", authToken: "authToken"}
User logged out. Redirecting...
```

And that is all you need to react to changes in your state with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

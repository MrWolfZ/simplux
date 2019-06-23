// this code is part of the simplux recipe "reacting to state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/reacting-to-state-changes

import { createMutations, createSimpluxModule } from '@simplux/core'
import { Observable } from 'rxjs'

// for this recipe we use a common scenario: managing a logged in user

interface UserState {
  isLoggedIn: boolean
  icon: string | undefined // this is a base64 image
  authToken: string | undefined
}

const initialState: UserState = {
  isLoggedIn: false,
  icon: undefined,
  authToken: undefined,
}

const userModule = createSimpluxModule({
  name: 'user',
  initialState,
})

// let's create a couple of basic mutations: for logging in and
// logging out as well as for updating the user's icon

const { logIn, logOut, setIcon } = createMutations(userModule, {
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

// a typical use case for reacting to state changes is redirecting
// the user to a different page after signing out; in this recipe
// we only log a message, but in a real application you would
// perform a navigation based on whatever rendering framework or
// library you are using

// a simplux module provides a function to register a handler to
// be called whenever the module's state changes; the handler will
// also be called with the module's current state immediately after
// subscribing
const unsubscribe = userModule.subscribeToStateChanges(state => {
  console.log('state changed:', state)
})

// often, you do not want to react to all changes to a module's
// state, but only to specific changes inside the module;
// subscribeToStateChanges allows this by providing the previous
// state as the second parameter to the handler; this allows you
// to compare any nested fields to determine whether the state
// change is relevant for your handler
userModule.subscribeToStateChanges(({ isLoggedIn }, previousState) => {
  const isLoggedInChanged = isLoggedIn !== previousState.isLoggedIn

  // by checking these two conditions we can react to the specific
  // change of the user logging out
  if (!isLoggedIn && isLoggedInChanged) {
    console.log('User logged out. Redirecting...')
  }
})

// if you are already using RxJS you can also create an observable
// of state changes
const observeUserState = () =>
  new Observable<UserState>(sub =>
    userModule.subscribeToStateChanges(state => sub.next(state)),
  )

const subscription = observeUserState().subscribe(state => {
  console.log('observed state with RxJS:', state)
})

// now let's play through a scenario of the user logging in, then
// changing their icon and finally logging out, and see how our
// reactions are called; we also unsubscribe from certain change
// handlers in between some of the changes

logIn('authToken', 'icon')

subscription.unsubscribe()

setIcon('newIcon')

// the subscribeToStateChanges function returns a callback that
// can be used to unsubscribe from state changes
unsubscribe()

logOut()

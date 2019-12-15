// this code is part of the simplux recipe "communicating between modules":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/advanced/communicating-between-modules

import { createMutations, createSimpluxModule } from '@simplux/core'

// in your application you will sometimes face situations where
// one module must be updated when another module changes; let's
// look at one such situation, where we have a `user` module to
// manage information about the logged in user and a `notifications`
// module that contains notifications for the logged in user; in
// this scenario we want to clear the notifications when the user
// logs out; let's start by creating our two modules

interface UserState {
  isLoggedIn: boolean
  authToken: string | undefined
}

const userModule = createSimpluxModule<UserState>({
  name: 'user',
  initialState: {
    isLoggedIn: false,
    authToken: undefined,
  },
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

const notificationsModule = createSimpluxModule<Notification[]>({
  name: 'notifications',
  initialState: [],
})

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

// we want subscribe to state changes of the `user` module and in
// the state change handler we clear the `notifications` module
const { unsubscribe } = user.subscribeToStateChanges(
  ({ isLoggedIn }, previousState) => {
    const userHasLoggedOut = !isLoggedIn && previousState.isLoggedIn

    if (userHasLoggedOut) {
      notifications.clear()
    }
  },
)

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

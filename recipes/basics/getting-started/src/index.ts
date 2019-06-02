import {
  createSimpluxModule,
  getSimpluxReducer,
  setReduxStoreForSimplux,
} from '@simplux/core'
import { combineReducers, createStore } from 'redux'

// first, we create our root reducer and the redux store (in an
// existing application you would simply use your existing reducer
// and store)
const rootReducer = combineReducers({
  // this key can be whatever you desire
  simplux: getSimpluxReducer(),
  // plus any of your other reducers
})

const store = createStore(rootReducer)

// then, we tell simplux to use our store; the second argument
// exists to tell simplux where it can find its state on the
// root state
setReduxStoreForSimplux(store, rootState => rootState.simplux)

// now we create our module and destructure it into all
// the functions we are going to use
const {
  getState,
  setState,
  subscribeToStateChanges,
  createMutations,
} = createSimpluxModule({
  name: 'counter',
  initialState: {
    counter: 0,
  },
})

// you can get the current state via getState
console.log('initial state:', getState())

// you can update the whole state at once
setState({ counter: 1 })
console.log('updated state:', getState())

// you can get notified whenever the state changes
const unsubscribe = subscribeToStateChanges(state =>
  console.log('state was updated:', state),
)

setState({ counter: 2 })

// instead of directly setting the state, usually it is better
// to define mutations
const { increment } = createMutations({
  increment: s => ({ ...s, counter: s.counter + 1 }),
})

// to update the module state, just call the mutation
console.log('incrementing counter...')
increment()

// you can define new mutations at any time (but you cannot
// overwrite an existing mutation)
const { decrement } = createMutations({
  decrement: s => ({ ...s, counter: s.counter - 1 }),
})

console.log('decrementing counter...')
decrement()

// if we want to stop getting notified, we just unsubscribe
unsubscribe()

// executing a mutation returns the updated state
console.log('final state:', decrement())

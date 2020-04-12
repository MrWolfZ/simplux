import { expectError, expectType } from 'tsd'
import { createModule } from '../src/module'
import { simpluxStore } from '../src/store'

interface State {
  count: number
}

const module = createModule<State>(simpluxStore, {
  name: 'test',
  initialState: { count: 0 },
})

expectType<(s: State) => void>(module.subscribeToStateChanges(s => {}).handler)
expectType<(s: State) => void>(module.subscribeToStateChanges(() => {}).handler)
expectType<(s1: State, s2: State) => void>(
  module.subscribeToStateChanges((s1, s2) => {}).handler,
)
expectType<() => void>(module.subscribeToStateChanges(s => {}).unsubscribe)

expectError(createModule(simpluxStore, { name: 0, initialState: 0 }))

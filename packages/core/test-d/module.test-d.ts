import { expectError, expectType } from 'tsd'
import { createModule } from '../src/module'
import { simpluxStore } from '../src/store'
import { Immutable } from '../src/types'

interface State {
  count: number
}

const module = createModule<State>(simpluxStore, {
  name: 'test',
  initialState: { count: 0 },
})

expectError((module.getState().count += 1))
expectType<(s: Immutable<State>) => void>(module.subscribeToStateChanges(s => {}).handler)
expectType<(s: Immutable<State>) => void>(module.subscribeToStateChanges(() => {}).handler)
expectType<(s1: Immutable<State>, s2: Immutable<State>) => void>(
  module.subscribeToStateChanges((s1, s2) => {}).handler,
)
expectType<() => void>(module.subscribeToStateChanges(s => {}).unsubscribe)

expectError(createModule(simpluxStore, { name: 0, initialState: 0 }))

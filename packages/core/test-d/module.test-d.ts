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

// @ts-expect-error
expectError((module.getState().count += 1))

expectType<(_: Immutable<State>) => void>(
  module.subscribeToStateChanges((_) => {}).handler,
)

expectType<(s: Immutable<State>) => void>(
  module.subscribeToStateChanges(() => {}).handler,
)

expectType<(_1: Immutable<State>, _2: Immutable<State>) => void>(
  module.subscribeToStateChanges((_1, _2) => {}).handler,
)

expectType<() => void>(module.subscribeToStateChanges((_) => {}).unsubscribe)

// @ts-expect-error
expectError(createModule(simpluxStore, { name: 0, initialState: 0 }))

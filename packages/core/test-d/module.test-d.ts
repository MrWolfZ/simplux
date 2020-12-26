import { createSimpluxModule, Immutable } from '@simplux/core'
import { expectError, expectType } from 'tsd'

interface State {
  count: number
}

const module = createSimpluxModule<State>({
  name: 'test',
  initialState: { count: 0 },
})

// @ts-expect-error
expectError((module.state().count += 1))

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
expectError(createSimpluxModule({ name: 0, initialState: 0 }))

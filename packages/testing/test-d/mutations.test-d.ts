import { createMutations, createSimpluxModule } from '@simplux/core'
import { mockMutation } from '@simplux/testing'
import { expectError, expectType } from 'tsd'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })
const { increment, incrementBy } = createMutations(module, {
  increment(s) {
    s.count += 1
  },
  incrementBy(s, amount: number) {
    s.count += amount
  },
})

expectType<() => State>(mockMutation(increment, () => ({ count: 0 }))[0])
expectType<() => void>(mockMutation(increment, () => ({ count: 0 }))[1])
expectType<() => State>(mockMutation(incrementBy, () => ({ count: 0 }))[0])
expectType<(a: number) => State>(
  mockMutation(incrementBy, (a: number) => ({ count: a }))[0],
)

// @ts-expect-error
expectError(mockMutation(incrementBy, (a: number) => a))

// @ts-expect-error
expectError(mockMutation(incrementBy, (_: string) => ({ count: 0 })))

// @ts-expect-error
expectError(mockMutation(incrementBy, (a: number, _: number) => ({ count: a })))

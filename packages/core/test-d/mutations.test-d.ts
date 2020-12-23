import {
  createMutations,
  createSimpluxModule,
  SimpluxMutation,
} from '@simplux/core'
import { expectAssignable, expectType } from 'tsd'

interface State {
  count: number
}

const module = createSimpluxModule<State>({
  name: 'test',
  initialState: { count: 0 },
})

const mutations = createMutations(module, {
  increment: (s) => {
    s.count += 1
  },
  incrementBy: (s, amount: number) => {
    s.count += amount
  },
})

expectType<SimpluxMutation<State, []>>(mutations.increment)
expectAssignable<() => State>(mutations.increment)
expectType<(s: State) => State>(mutations.increment.withState)
expectType<() => { type: string; args: [] }>(mutations.increment.asAction)

expectType<SimpluxMutation<State, [number]>>(mutations.incrementBy)
expectAssignable<(a: number) => State>(mutations.incrementBy)
expectType<(s: State, a: number) => State>(mutations.incrementBy.withState)
expectType<(a: number) => { type: string; args: [number] }>(
  mutations.incrementBy.asAction,
)

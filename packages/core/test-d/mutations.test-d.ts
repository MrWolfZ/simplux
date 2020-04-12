import { expectAssignable, expectError, expectType } from 'tsd'
import { createModule } from '../src/module'
import { createMutations } from '../src/mutations'
import { simpluxStore } from '../src/store'
import { Immutable, Mutable } from '../src/types'

interface State {
  count: number
}

const module = createModule<State>(simpluxStore, {
  name: 'test',
  initialState: { count: 0 },
})

const mutations = createMutations(module, {
  increment: s => {
    s.count += 1
  },
  incrementBy: (s, amount: number) => {
    s.count += amount
  },
})

expectAssignable<() => State>(mutations.increment)
expectType<(s: State | Mutable<State>) => State>(mutations.increment.withState)
expectType<() => { type: string; args: [] }>(mutations.increment.asAction)
expectAssignable<(a: number) => State>(mutations.incrementBy)
expectType<(s: State | Mutable<State>, a: number) => State>(
  mutations.incrementBy.withState,
)
expectType<(a: number) => { type: string; args: [number] }>(
  mutations.incrementBy.asAction,
)

const immutableModule = createModule<Immutable<State>>(simpluxStore, {
  name: 'test',
  initialState: { count: 0 },
})

const immutableMutations = createMutations(immutableModule, {
  increment: s => {
    expectType<State>(s)
    s.count += 1
  },
  incrementBy: (s, amount: number) => {
    expectType<State>(s)
    s.count += amount
  },
})

expectError((immutableModule.getState().count += 1))
expectAssignable<() => Immutable<State>>(immutableMutations.increment)
expectAssignable<(s: Immutable<State>) => Immutable<State>>(
  immutableMutations.increment.withState,
)
expectError((immutableMutations.increment().count += 1))

import { expectType } from 'tsd'
import { createModule } from '../src/module'
import { createMutations } from '../src/mutations'
import { simpluxStore } from '../src/store'

interface State {
  count: number
}

const module = createModule<State>(simpluxStore, {
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

expectType<() => State>(mutations.increment)
expectType<(s: State) => State>(mutations.increment.withState)
expectType<() => { type: string; args: [] }>(mutations.increment.asAction)

expectType<(a: number) => State>(mutations.incrementBy)
expectType<(s: State, a: number) => State>(mutations.incrementBy.withState)
expectType<(a: number) => { type: string; args: [number] }>(
  mutations.incrementBy.asAction,
)

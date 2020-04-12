import { expectAssignable, expectError, expectType } from 'tsd'
import { createModule } from '../src/module'
import { createSelectors } from '../src/selectors'
import { simpluxStore } from '../src/store'
import { Immutable } from '../src/types'

interface State {
  count: number
}

const module = createModule<State>(simpluxStore, {
  name: 'test',
  initialState: { count: 0 },
})

const selectors = createSelectors(module, {
  id: s => s,
  plusOne: s => s.count + 1,
  plus: (s, amount: number) => s.count + amount,
})

expectAssignable<() => State>(selectors.id)
expectType<(s: State) => State>(selectors.id.withState)
expectAssignable<() => number>(selectors.plusOne)
expectType<(s: State) => number>(selectors.plusOne.withState)
expectAssignable<(a: number) => number>(selectors.plus)
expectType<(s: State, a: number) => number>(selectors.plus.withState)

const immutableModule = createModule<Immutable<State>>(simpluxStore, {
  name: 'test',
  initialState: { count: 0 },
})

const immutableSelectors = createSelectors(immutableModule, {
  id: s => {
    expectType<Immutable<State>>(s)
    return s
  },
  plusOne: s => s.count + 1,
  plus: (s, amount: number) => s.count + amount,
})

expectAssignable<() => Immutable<State>>(immutableSelectors.id)
expectError((immutableSelectors.id().count += 1))
expectAssignable<() => number>(immutableSelectors.plusOne)
expectAssignable<(s: Immutable<State>) => number>(
  immutableSelectors.plusOne.withState,
)

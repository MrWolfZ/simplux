import { expectError, expectType } from 'tsd'
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
  id: (s) => s,
  plusOne: (s) => s.count + 1,
  plus: (s, amount: number) => s.count + amount,
})

expectType<() => Immutable<State>>(selectors.id)
expectType<(s: Immutable<State>) => Immutable<State>>(selectors.id.withState)

// @ts-expect-error
expectError((selectors.id().count += 1))

expectType<() => number>(selectors.plusOne)
expectType<(s: Immutable<State>) => number>(selectors.plusOne.withState)

expectType<(a: number) => number>(selectors.plus)
expectType<(s: Immutable<State>, a: number) => number>(selectors.plus.withState)

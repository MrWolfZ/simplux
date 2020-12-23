import { expectAssignable, expectError, expectType } from 'tsd'
import { createModule } from '../src/module'
import { createSelectors, SimpluxSelector } from '../src/selectors'
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

expectType<SimpluxSelector<State, [], Immutable<State>>>(selectors.id)
expectAssignable<() => Immutable<State>>(selectors.id)
expectType<(s: Immutable<State>) => Immutable<State>>(selectors.id.withState)

// @ts-expect-error
expectError((selectors.id().count += 1))

expectType<SimpluxSelector<State, [], number>>(selectors.plusOne)
expectAssignable<() => number>(selectors.plusOne)
expectType<(s: Immutable<State>) => number>(selectors.plusOne.withState)

expectType<SimpluxSelector<State, [number], number>>(selectors.plus)
expectAssignable<(a: number) => number>(selectors.plus)
expectType<(s: Immutable<State>, a: number) => number>(selectors.plus.withState)

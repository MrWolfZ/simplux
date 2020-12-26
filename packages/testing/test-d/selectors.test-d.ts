import { createSelectors, createSimpluxModule } from '@simplux/core'
import { mockSelector } from '@simplux/testing'
import { expectError, expectType } from 'tsd'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })
const { plusOne, plus } = createSelectors(module, {
  plusOne: (s) => s.count + 1,
  plus: (s, amount: number) => s.count + amount,
})

expectType<() => number>(mockSelector(plusOne, () => 0)[0])
expectType<() => void>(mockSelector(plusOne, () => 0)[1])
expectType<() => number>(mockSelector(plus, () => 0)[0])
expectType<(a: number) => number>(mockSelector(plus, (a: number) => a)[0])

// @ts-expect-error
expectError(mockSelector(plus, (a: number) => ''))

// @ts-expect-error
expectError(mockSelector(plus, (s: string) => 0))

// @ts-expect-error
expectError(mockSelector(plus, (a: number, b: number) => 0))

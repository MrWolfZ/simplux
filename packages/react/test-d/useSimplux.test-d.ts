import { createSelectors, createSimpluxModule, Immutable } from '@simplux/core'
import { useSimplux } from '@simplux/react'
import { expectError, expectType } from 'tsd'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })
const selectors = createSelectors(module, {
  id: (s) => s,
  plusOne: (s) => s.count + 1,
  plus: (s, amount: number) => s.count + amount,
})

expectType<Immutable<State>>(useSimplux(module))
expectType<Immutable<State>>(useSimplux(selectors.id))
expectType<number>(useSimplux(selectors.plusOne))
expectType<number>(useSimplux(selectors.plus, 1))

// @ts-expect-error
expectError(useSimplux(selectors.plus, ''))

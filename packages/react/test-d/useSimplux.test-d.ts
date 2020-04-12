import { createSelectors, createSimpluxModule } from '@simplux/core'
import { expectError, expectType } from 'tsd'
import { useSimplux } from '../src/useSimplux'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })
const selectors = createSelectors(module, {
  plusOne: s => s.count + 1,
  plus: (s, amount: number) => s.count + amount,
})

expectType<State>(useSimplux(module))
expectType<number>(useSimplux(selectors.plusOne))
expectType<number>(useSimplux(selectors.plus, 1))
expectError(useSimplux(selectors.plus, ''))

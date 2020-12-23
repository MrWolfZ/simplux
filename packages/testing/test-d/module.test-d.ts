import { createSimpluxModule } from '@simplux/core'
import { mockModuleState } from '@simplux/testing'
import { expectError, expectType } from 'tsd'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })

expectType<() => void>(mockModuleState(module, { count: 0 }))

// @ts-expect-error
expectError(mockModuleState(module, { count: '' }))

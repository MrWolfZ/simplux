import { createSimpluxModule } from '@simplux/core'
import { expectError, expectType } from 'tsd'
import { mockModuleState } from '../src/module'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })

expectType<() => void>(mockModuleState(module, { count: 0 }))
expectError(mockModuleState(module, { count: '' }))

import { createMutations, createSimpluxModule } from '@simplux/core'
import { expectType } from 'tsd'
import { createModuleServiceBaseClass } from '../src/service'

interface State {
  count: number
}

const module = createSimpluxModule<State>('module', { count: 0 })
const mutations = createMutations(module, {
  increment(s) {
    s.count += 1
  },
})

const BaseClass = createModuleServiceBaseClass(module, mutations, {})
const serviceInstance = new BaseClass()

expectType<State>(serviceInstance.getCurrentState())

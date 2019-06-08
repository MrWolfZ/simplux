// this code is part of the simplux recipe "testing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state
import '@simplux/selectors'
import { getCounterState } from './counter.module'

console.log(`counter module state:`, getCounterState())

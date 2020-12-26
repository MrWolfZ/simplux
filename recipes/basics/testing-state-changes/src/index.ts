// this code is part of the simplux recipe "testing state changes":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-state-changes

// this file only exists for code sandbox to execute correctly;
// for the tests please see the counter.module.spec.ts file

import { counter } from './counter.module'

console.log(`counter module state:`, counter.state())

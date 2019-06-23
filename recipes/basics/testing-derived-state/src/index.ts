// this code is part of the simplux recipe "testing derived state":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/basics/testing-derived-state

// this file only exists for code sandbox to execute correctly;
// for the tests please see the counter.module.spec.ts file

import { counterModule } from './counter.module'

console.log(`counter module state:`, counterModule.getState())

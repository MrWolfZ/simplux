// this code is part of the simplux recipe "using simplux in my Angular application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/angular/using-in-angular-application

import { Injectable } from '@angular/core'
import { createModuleServiceBaseClass } from '@simplux/angular'
import { counterModule, counterMutations, counterSelectors } from './counter'

// this function creates a base class which contains methods for
// interacting with the module
const CounterServiceBase = createModuleServiceBaseClass(
  counterModule,
  counterMutations,
  counterSelectors,
)

// we can create an Angular service and extend the module's generated
// base class; we suggest that you don't add any other functionality
// to this service, since that functionality would be difficult to
// test in isolation from the module
@Injectable({ providedIn: 'root' })
export class CounterService extends CounterServiceBase {}

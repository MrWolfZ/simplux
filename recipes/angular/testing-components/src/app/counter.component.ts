// this code is part of the simplux recipe "using simplux in my Angular application":
// https://github.com/MrWolfZ/simplux/tree/master/recipes/angular/using-in-angular-application

import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { CounterService } from './counter.service'

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  initialValue: number

  value$: Observable<number>
  valueTimesTwo$: Observable<number>
  valueTimesFive$: Observable<number>

  // we inject our module's service as we would any other service
  constructor(private counter: CounterService) {
    // the service has a method to get a snapshot of the module's
    // current state
    this.initialValue = counter.getCurrentState().value

    // for each selector the service has a method that returns an
    // observable; the observable immediately emits the result of
    // the selector applied to the module's current state when
    // subscribed to; new values are emitted whenever the state
    // and the selector's result for that state change
    this.value$ = counter.value()

    // the selectors can have arguments as well
    this.valueTimesTwo$ = counter.valueTimes(2)

    // you can get an observable of all state changes and transform
    // it yourself if required; the observable immediately emits the
    // module's current state when subscribed to; we do recommend to
    // always use selectors if possible since they are simpler to test
    this.valueTimesFive$ = counter
      .selectState()
      .pipe(map(state => state.value * 5))
  }

  incrementCounter() {
    // the service has a method for each mutation that can be called
    // to execute that mutation
    this.counter.increment()
  }

  incrementCounterByFive() {
    // your mutations can have arguments as well
    this.counter.incrementBy(5)
  }
}

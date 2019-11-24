# Recipe: using **simplux** in my Angular application

This recipe shows you how simple it is to integrate **simplux** into your Angular application.

If you are new to **simplux** there is [a recipe](../../basics/getting-started#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/angular/using-in-angular-application).

Before we start let's install **simplux** (we assume you already have all packages required for Angular installed).

```sh
npm i @simplux/angular @simplux/core -S
```

Now we're ready to go.

In this recipe we are going to build a simple counter component. Let's start by creating our module with some simple mutations and selectors ([this recipe](../../basics/computing-derived-state#readme) will help you if you are unfamiliar with selectors).

```ts
import {
  createSelectors,
  createSimpluxModule,
  createMutations,
} from '@simplux/core'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const counterMutations = createMutations(counterModule, {
  increment(state) {
    state.value += 1
  },
  incrementBy(state, amount: number) {
    state.value += amount
  },
})

const counterSelectors = createSelectors(counterModule, {
  value: ({ value }) => value,
  valueTimes: ({ value }, multiplier: number) => value * multiplier,
})
```

We could use this module directly in our Angular components but that would not match the way Angular applications are written. Instead, what we want is a service that gives us access to the module. This is where the **simplux** angular extension comes into play. It provides a function `createModuleServiceBaseClass` that creates a base class which contains methods for interacting with the module. We can then create an Angular service that extends this generated class.

```tsx
import { createModuleServiceBaseClass } from '@simplux/angular'

const CounterServiceBase = createModuleServiceBaseClass(
  counterModule,
  counterMutations,
  counterSelectors,
)

@Injectable({ providedIn: 'root' })
export class CounterService extends CounterServiceBase {}
```

> We suggest that you don't add any other functionality to the service, since that functionality would be difficult to test in isolation from the module.

Now let's see how we can use this service in a component.

```ts
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
```

And that is all you need to use **simplux** in your Angular application.

> **simplux** is compatible with any version of Angular but it requires at least version 6 of [RxJS](https://www.learnrxjs.io/) for the support of pipeable operators.

We encourage you to also learn about [how to test](../testing-components#readme) the component that we have just created.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

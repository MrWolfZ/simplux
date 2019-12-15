# Recipe: testing my Angular components

This recipe shows you how simple it is to test your Angular components with **simplux**.

If you are new to using **simplux** with Angular there is [a recipe](../using-in-angular-application#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/angular/testing-components). Note that the tests don't work in the sandbox since it does not support Karma. If you want to run the tests you can clone this repository and run the tests locally.

Before we start let's install **simplux** (we assume you already have all packages required for Angular installed).

```sh
npm i @simplux/angular @simplux/core @simplux/testing -S
```

Now we're ready to go.

> You may already have noticed that there is nothing special about testing your components if you use services for your **simplux** modules (as described in [this recipe](../using-in-angular-application#readme)). You can simply mock a service (per default Angular applications use [Jasmine](https://jasmine.github.io/) for this) and instantiate your component with the mock.

In this recipe we are going to test a simple counter component. Let's start by creating a module for the counter as well as the component (this is the same code as in [this recipe](../using-in-angular-application#readme)).

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { createModuleServiceBaseClass } from '@simplux/angular'
import { createSelectors, createSimpluxModule, createMutations } from '@simplux/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

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

const CounterServiceBase = createModuleServiceBaseClass(
  counterModule,
  counterMutations,
  counterSelectors,
)

@Injectable({ providedIn: 'root' })
class CounterService extends CounterServiceBase {}

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

  constructor(private counter: CounterService) {
    this.initialValue = counter.getCurrentState().value
    this.value$ = counter.value()
    this.valueTimesTwo$ = counter.valueTimes(2)

    this.valueTimesFive$ = counter.selectState().pipe(map(state => state.value * 5))
  }

  incrementCounter() {
    this.counter.increment()
  }

  incrementCounterByFive() {
    this.counter.incrementBy(5)
  }
}
```

Let's look at how we can test this component.

> Below you will only see code snippets. If you prefer you can instead just [look at the full code](src/app/counter.component.spec.ts) directly.

We need to instantiate the component with a mocked instance of our module's service, which we can do with `jasmine.createSpyObj`.

```ts
counterSpy = jasmine.createSpyObj<CounterService>(
  'CounterService',
  // here we list all the methods that are used inside our component
  ['getCurrentState', 'value', 'valueTimes', 'selectState', 'increment', 'incrementBy'],
)

// we configure all selector spies to return test values
counterSpy.getCurrentState.and.returnValue({ value: 10 })
counterSpy.value.and.returnValue(of(10))
counterSpy.valueTimes.and.callFake(multiplier => of(10 * multiplier))
counterSpy.selectState.and.returnValue(of({ value: 10 }))
```

We also need to provide this mock value in the testing module.

```ts
TestBed.configureTestingModule({
  declarations: [CounterComponent],
  providers: [{ provide: CounterService, useValue: counterSpy }],
}).compileComponents()
```

Now we can write tests. To test we use the right selector we subscribe a spy to the observable and verify it was called with the correct value. We can also assert that the correct selector method was called.

```ts
it('selects the value', () => {
  const spy = jasmine.createSpy()

  component.value$.subscribe(spy)

  expect(spy).toHaveBeenCalledWith(10)

  // we can also assert that the correct selector method was called
  expect(counterSpy.value).toHaveBeenCalled()
})
```

To test that our component executes the right mutations we can simply assert that the mutation method on our service spy was called.

```ts
it('increments the counter', () => {
  component.incrementCounter()

  expect(counterSpy.increment).toHaveBeenCalled()
})
```

And that is all you need to test your Angular components with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

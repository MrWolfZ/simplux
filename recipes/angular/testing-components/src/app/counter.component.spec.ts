import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { CounterComponent } from './counter.component'
import { CounterService } from './counter.service'

describe('CounterComponent', () => {
  let counterSpy: jasmine.SpyObj<CounterService>
  let fixture: ComponentFixture<CounterComponent>
  let component: CounterComponent

  beforeEach(async(() => {
    // we can use jasmine to create a mock instance of our service
    counterSpy = jasmine.createSpyObj<CounterService>(
      'CounterService',
      // here we list all the methods that are used inside our component
      [
        'getCurrentState',
        'selectValue',
        'selectValueTimes',
        'selectState',
        'increment',
        'incrementBy',
      ],
    )

    // we configure all selector spies to return test values
    counterSpy.getCurrentState.and.returnValue({ value: 10 })
    counterSpy.selectValue.and.returnValue(of(10))
    counterSpy.selectValueTimes.and.callFake(multiplier => of(10 * multiplier))
    counterSpy.selectState.and.returnValue(of({ value: 10 }))

    TestBed.configureTestingModule({
      declarations: [CounterComponent],
      providers: [{ provide: CounterService, useValue: counterSpy }],
    }).compileComponents()

    fixture = TestBed.createComponent(CounterComponent)
    component = fixture.debugElement.componentInstance
  }))

  it('can be created', () => {
    expect(component).toBeTruthy()
  })

  it('gets the current value', () => {
    expect(component.initialValue).toBe(10)
  })

  // to test that we select the correct slice of the state we can
  // just subscribe a spy to the observable and verify it was called
  // with the correct selected value
  it('selects the value', () => {
    const spy = jasmine.createSpy()

    component.value$.subscribe(spy)

    expect(spy).toHaveBeenCalledWith(10)

    // we can also assert that the correct selector method was called
    expect(counterSpy.selectValue).toHaveBeenCalled()
  })

  it('selects the value times two', () => {
    const spy = jasmine.createSpy()

    component.valueTimesTwo$.subscribe(spy)

    expect(spy).toHaveBeenCalledWith(20)
    expect(counterSpy.selectValueTimes).toHaveBeenCalled()
  })

  it('selects the value times five', () => {
    const spy = jasmine.createSpy()

    component.valueTimesFive$.subscribe(spy)

    expect(spy).toHaveBeenCalledWith(50)
    expect(counterSpy.selectState).toHaveBeenCalled()
  })

  // to test that we execute the correct mutations we can simply
  // assert on the spy that is automatically created by the
  // spy object
  it('increments the counter', () => {
    component.incrementCounter()

    expect(counterSpy.increment).toHaveBeenCalled()
  })

  it('increments the counter by 5', () => {
    component.incrementCounterByFive()

    expect(counterSpy.incrementBy).toHaveBeenCalledWith(5)
  })
})

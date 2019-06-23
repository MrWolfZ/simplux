# Recipe: testing my React components that read and change state

This recipe shows you how simple it is to test your React components that read and change state with **simplux**.

If you are new to using **simplux** with React there is [a recipe](../using-in-react-application#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state).

Before we start let's install all the packages we need (we assume you already have all packages required for React installed).

```sh
npm i @simplux/core @simplux/react @simplux/selectors @simplux/testing redux -S
```

Now we're ready to go.

> The code snippets in this recipe use [enzyme](https://airbnb.io/enzyme/) for rendering and asserting our components. However, any other test renderer (e.g. [react-testing-library](https://github.com/testing-library/react-testing-library)) works just as well (in fact the [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state) contains tests for both the mentioned renderers).

In this recipe we are going to test a simple counter component. Let's start by creating a module for the counter as well as the `Counter` component (this is the same code as in [this recipe](../using-in-react-application#readme)).

```tsx
import { createSimpluxModule } from '@simplux/core'
import React from 'react'

const counterModule = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const useCounter = createSelectorHook(counterModule)

const { increment, incrementBy } = createMutations(counterModule, {
  increment(state) {
    state.value += 1
  },

  incrementBy(state, amount: number) {
    state.value += amount
  },
})

const { selectCounterValue, selectCounterValueTimes } = createSelectors(
  counterModule,
  {
    selectCounterValue: ({ value }) => value,

    selectCounterValueTimes: ({ value }, multiplier: number) =>
      value * multiplier,
  },
)

const Counter = () => {
  const value = useCounter(selectCounterValue)
  const valueTimesTwo = useCounter(s => s.value * 2)
  const selectCounterValueTimesFive = selectCounterValueTimes.asFactory(5)
  const valueTimesFive = useCounter(selectCounterValueTimesFive)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value * 2: {valueTimesTwo}</span>
      <br />
      <span>value * 5: {valueTimesFive}</span>
      <br />
      <button onClick={increment}>Increment</button>
      <br />
      <button onClick={() => incrementBy(5)}>Increment by 5</button>
    </>
  )
}
```

Let's start by looking at how we can test components that access a module's state.

The best way to test these kinds of components is to test them in isolation from the module(s) they access. That means we do not want any real module's state to be accessed during the test. This is where the **simplux** testing extension comes into play: it allows us to mock a module's state.

```tsx
import { mockModuleState } from '@simplux/testing'

it('displays the value', () => {
  // all access to the module's state after this call will return
  // the mocked state instead of the real module's state; this
  // includes accesses via the module's selector hook
  mockModuleState(counterModule, { value: 10 })

  const wrapper = shallow(<Counter />)
  const expected = <span>value: 10</span>

  expect(wrapper.contains(expected)).toBe(true)
})

// mocking the state works with any kind of selector, including
// inline selectors as used by our Counter component
it('displays the value times two', () => {
  mockModuleState(counterModule, { value: 20 })

  const wrapper = shallow(<Counter />)
  const expected = <span>value * 2: 40</span>

  expect(wrapper.contains(expected)).toBe(true)
})
```

The `mockModuleState` call above mocks the module's state indefinitely. The testing extension provides a way to clear all simplux mocks which we can simply do after each test.

```ts
import { clearAllSimpluxMocks } from '@simplux/testing'

afterEach(clearAllSimpluxMocks)
```

This covers testing components that read a module's state with a selector hook. As you can see it is quite simple.

Now let's look at how we can test components that change the state. Changing the state in **simplux** is done through mutations. There is [a dedicated recipe](../../advanced/testing-code-using-mutations#readme) that shows you how to test your code that uses mutations. However, we will still fully test our `Counter` component here.

The best way to test these components is to [mock the mutation](../../advanced/testing-code-using-mutations#readme).

```tsx
import { mockMutation } from '@simplux/testing'

it('increments the counter when the "Increment" button is clicked', () => {
  // it is a good idea to always mock the module's state for a test
  mockModuleState(counterModule, { value: 10 })

  const incrementMock = jest.fn()
  mockMutation(increment, incrementMock)

  const wrapper = shallow(<Counter />)

  wrapper
    .findWhere(el => el.type() === 'button' && el.text() === 'Increment')
    .simulate('click')

  expect(incrementMock).toHaveBeenCalled()
})

// of course this works as well for mutations that take arguments
it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
  mockModuleState(counterModule, { value: 10 })

  const incrementByMock = jest.fn()
  mockMutation(incrementBy, incrementByMock)

  const wrapper = shallow(<Counter />)

  wrapper
    .findWhere(el => el.type() === 'button' && el.text() === 'Increment by 5')
    .simulate('click')

  expect(incrementByMock).toHaveBeenCalledWith(5)
})
```

And that is all you need to test your React components that read and change state with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

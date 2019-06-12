# Recipe: testing my React components that read and change state

This recipe shows you how simple it is to test your React components that read and change state with **simplux**.

If you are new to using **simplux** with React there is [a recipe](../using-in-react-application#readme) that will help you get started before you follow this recipe.

> You can play with the code for this recipe in this [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state).

Before we start let's install all the packages we need (we assume you already have all packages required for React installed).

```sh
npm i @simplux/core @simplux/core-testing @simplux/immer @simplux/react @simplux/react-testing @simplux/selectors redux immer -S
```

We also need to activate the all the extensions by importing the packages. You need add these imports once globally with the mechanism your test framework provides before any tests are run. The React app for this recipe was created with [create-react-app](https://github.com/facebook/create-react-app) and therefore we use [Jest](https://jestjs.io/) as a test runner which allows us to have a file `src/setupTests.js` where we can place the imports.

```ts
import '@simplux/core-testing'
import '@simplux/immer'
import '@simplux/react'
import '@simplux/react-testing'
import '@simplux/selectors'
```

The code snippets in this recipe use [enzyme](https://airbnb.io/enzyme/) for rendering and asserting our components. However, any other test renderer (e.g. [react-testing-library](https://github.com/testing-library/react-testing-library)) works just as well (in fact the [code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/react/testing-components-using-state) contains tests for both the mentioned test renderers).

Now we're ready to go.

In this recipe we are going to test a simple counter component. Let's start by creating a module for the counter as well as the `Counter` component (this is the same code as in [this recipe](../using-in-react-application#readme)).

```tsx
import { createSimpluxModule } from '@simplux/core'
import React from 'react'

const {
  getState,
  setState,
  createMutations,
  createSelectors,
  react: {
    hooks: { useSelector },
  },
} = createSimpluxModule({
  name: 'counter',
  initialState: {
    value: 0,
  },
})

const getCounterValue = () => getState().value
const setCounterValue = (value: number) => setState({ value })
const useCounter = useSelector

const { increment, incrementBy } = createMutations({
  increment(state) {
    state.value += 1
  },

  incrementBy(state, amount: number) {
    state.value += amount
  },
})

const { selectCounterValue, selectCounterValueTimes } = createSelectors({
  selectCounterValue: ({ value }) => value,

  selectCounterValueTimes: ({ value }, multiplier: number) =>
    value * multiplier,
})

const Counter = () => {
  const value = useCounter(selectCounterValue)
  const valueTimesTwo = useCounter(s => s.value * 2)
  const valueTimesFive = useCounter(selectCounterValueTimes.asFactory(5))

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

One possible way to test your component that reads state is to test it with the real module by setting the module's state before rendering the component. This is more of an integration style of testing that verifies everything works together.

```tsx
it('displays the value', () => {
  setCounterValue(10)

  const wrapper = shallow(<Counter />)
  const expected = <span>value: 10</span>

  expect(wrapper.contains(expected)).toBe(true)
})
```

However, usually it is better to test your component in isolation without interacting with with the real module. This is where the react-testing extension comes into play. If you are using the module's selector hook (from the react extension) it allows you to mock the state that the hook will use. Instead of using the real module's state the hook will call the selector with the provided mock state.

```tsx
import { mockSelectorHookState } from '@simplux/react-testing'

it('displays the value times two (mocked)', () => {
  mockSelectorHookState(useCounter, {
    value: 20,
  })

  const wrapper = shallow(<Counter />)
  const expected = <span>value * 2: 40</span>

  expect(wrapper.contains(expected)).toBe(true)
})
```

The `mockSelectorHookState` call above mocks the state indefinitely. It is recommended to remove the mock state after each test and create a new mock state in each test.

```ts
import {
  removeAllSelectorHookMockStates,
  removeSelectorHookMockState,
} from '@simplux/react-testing'

afterEach(() => {
  // we can remove the mock state for a single selector hook
  removeSelectorHookMockState(useCounter)

  // alternatively we can also just remove all selector hook mocks
  removeAllSelectorHookMockStates()
})
```

Since removing the mock states is a bit cumbersome to do for every test and selector hook, there is a `mockSelectorHookStateForNextRender` function that only mocks the module's state for the next render in which the selector hook is used. This works even if you have nested components that use the selector hook (although with enzyme's shallow rendering that does not matter).

```tsx
import { mockSelectorHookStateForNextRender } from '@simplux/react-testing'

it('displays the value times five (mocked during render)', () => {
  mockSelectorHookStateForNextRender(useCounter, { value: 30 })

  const wrapper = shallow(<Counter />)
  const expected = <span>value * 5: 150</span>

  expect(wrapper.contains(expected)).toBe(true)
})
```

This covers testing components that read a module's state with a selector hook. Now let's look at how we can test components that change the state. Changing the state in **simplux** is done through mutations. There is [a dedicated recipe](../../advanced/testing-code-using-mutations#readme) that shows you how to test your code that uses mutations. However, we will still fully test our `Counter` component here.

As in our first test above, testing your components that change state can be done with the real module by setting the module's state before rendering the component, then triggering the state change, and finally checking the module's state. This is once again more of an integration style of testing that verifies everything works together.

```tsx
it('triggers an increment when the "Increment" button is clicked', () => {
  setCounterValue(10)

  const wrapper = shallow(<Counter />)

  wrapper
    .findWhere(el => el.type() === 'button' && el.text() === 'Increment')
    .simulate('click')

  expect(getCounterValue()).toBe(11)
})
```

However, the recommended way to test these components is to [mock the mutation](../../advanced/testing-code-using-mutations#readme).

```tsx
import { mockMutationOnce } from '@simplux/core-testing'

it('triggers an increment by 5 when the "Increment by 5" button is clicked', () => {
  // it is also a good idea to always mock the module's state
  mockSelectorHookStateForNextRender(useCounter, { value: 10 })
  const incrementBySpy = mockMutationOnce(incrementBy, jest.fn())

  const wrapper = shallow(<Counter />)

  wrapper
    .findWhere(el => el.type() === 'button' && el.text() === 'Increment by 5')
    .simulate('click')

  expect(incrementBySpy).toHaveBeenCalledWith(5)
})
```

And that is all you need to test your React components that read and change state with **simplux**.

Have a look at our [other recipes](../../../../..#recipes) to learn how **simplux** can help you make your life simple in other situations.

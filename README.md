# simplux - simple, scalable state management for web applications

**simplux** is state management as it should be: simple to use, no boilerplate, type-safe but not verbose, and with excellent testability. **simplux** provides out-of-the-box support for [React](https://reactjs.org/) and [Angular](https://angular.io/), but can be used with any framework.

[![npm version](https://badge.fury.io/js/%40simplux%2Fcore.svg)](https://www.npmjs.com/org/simplux)
[![Build Status](https://github.com/MrWolfZ/simplux/workflows/Build/badge.svg?branch=master)](https://github.com/MrWolfZ/simplux/actions?query=workflow:Build)
[![codecov](https://codecov.io/gh/MrWolfZ/simplux/branch/master/graph/badge.svg)](https://codecov.io/gh/MrWolfZ/simplux)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quickstart

```sh
npm i @simplux/core -S
```

```ts
import { createSimpluxModule, createMutations, createSelectors } from '@simplux/core'

// state in simplux is contained in modules identified by a unique name
const counterModule = createSimpluxModule('counter', { value: 0 })

export const counter = {
  ...counterModule,

  // use mutations to modify the state
  ...createMutations(counterModule, {
    increment(state) {
      state.value += 1
    },
    incrementBy(state, amount: number) {
      state.value += amount
    },
  }),

  // use selectors to access the state
  ...createSelectors(counterModule, {
    value: (state) => state.value,
    plus: (state, amount: number) => state.value + amount,
  }),
}

counter.increment()
console.log('incremented counter:', counter.value())
console.log('counter value + 2:', counter.plus(2))

counter.incrementBy(5)
console.log('incremented counter by 5:', counter.value())
```

See this example in action [here](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/quickstart/counter). For a more detailed look into how **simplux** can make your life simple follow our recipe for [getting started](recipes/basics/getting-started#readme).

### React

```sh
npm i @simplux/core @simplux/react -S
```

```tsx
import { SimpluxProvider, useSimplux } from '@simplux/react'
import React from 'react'
import { render } from 'react-dom'
import { counter } from './counter.module'

const Counter = () => {
  const value = useSimplux(counter.value)
  const valuePlusFive = useSimplux(counter.plus, 5)

  return (
    <>
      <span>value: {value}</span>
      <br />
      <span>value + 5: {valuePlusFive}</span>
      <br />
      <button onClick={counter.increment}>Increment</button>
      <br />
      <button onClick={() => counter.incrementBy(5)}>Increment by 5</button>
    </>
  )
}

const App = () => (
  <SimpluxProvider>
    <Counter />
  </SimpluxProvider>
)

render(<App />, document.getElementById('root'))
```

See this example in action [here](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/quickstart/react). For a more detailed look into how **simplux** can power up your React application follow our recipe for [using **simplux** in your React application](recipes/react/using-in-react-application#readme).

### Angular

See the recipe for [using **simplux** in your Angular application](recipes/angular/using-in-angular-application#readme).

## Recipes

Instead of traditional documentation **simplux** has these recipes that will show you how it can make life simple for you. Each recipe will help you solve one particular task that you will typically face during development.

> For every "How do I do X?" you have ever asked yourself, there should be a recipe here. If you find one that is missing, please let us know by [creating an issue](https://github.com/MrWolfZ/simplux/issues/new) or even better, provide the recipe as a pull request.

### Basics

- [getting started](recipes/basics/getting-started#readme)
- [testing my state changes](recipes/basics/testing-state-changes#readme)
- [computing derived state](recipes/basics/computing-derived-state#readme)
- [testing derived state](recipes/basics/testing-derived-state#readme)

### Advanced

- [creating non-trivial modules](recipes/advanced/creating-non-trivial-modules#readme)
- [testing my code that uses mutations](recipes/advanced/testing-code-using-mutations#readme)
- [testing my code that uses modules and selectors](recipes/advanced/testing-code-using-modules-and-selectors#readme)
- [reacting to state changes](recipes/advanced/reacting-to-state-changes#readme)
- [creating testable side effects (like loading data from my API)](recipes/advanced/creating-testable-side-effects#readme)
- [organizing my application state](recipes/advanced/organizing-application-state#readme)
- [communicating between modules](recipes/advanced/communicating-between-modules#readme)
- [managing collections of entities](recipes/advanced/managing-entity-collections#readme) (work-in-progress)
- [composing my mutations](recipes/advanced/composing-mutations#readme)
- [composing my selectors](recipes/advanced/composing-selectors#readme)
- [routing between different views in my web application](recipes/advanced/routing-in-web-application#readme) (work-in-progress)
- [using **simplux** in my application together with Redux](recipes/advanced/using-in-redux-application#readme)
- [debugging with Redux DevTools](recipes/advanced/debugging-with-redux-devtools#readme)

### React

- [using **simplux** in my React application](recipes/react/using-in-react-application#readme)
- [testing my React components](recipes/react/testing-components#readme)
- [building non-trivial React applications](recipes/react/building-non-trivial-applications#readme) (work-in-progress)
- [using lazy loaded components/code splitting](recipes/react/using-lazy-loading-code-splitting#readme)
- [using hot module reloading (HMR)](recipes/react/using-hot-module-reloading#readme)
- [routing between different views in my React application](recipes/react/routing-in-react-application#readme) (work-in-progress)
- [using server-side rendering (SSR)](recipes/react/using-server-side-rendering#readme) (work-in-progress)
- [using **simplux** in my React Native application](recipes/react/using-in-react-native-application#readme) (work-in-progress)
- [routing between different views in my React Native application](recipes/react/routing-in-react-native-application#readme) (work-in-progress)

### Angular

- [using **simplux** in my Angular application](recipes/angular/using-in-angular-application#readme)
- [testing my Angular components](recipes/angular/testing-components#readme)
- [building non-trivial Angular applications](recipes/angular/building-non-trivial-applications#readme) (work-in-progress)
- [using lazy loaded routes/code splitting](recipes/angular/using-lazy-loading-code-splitting#readme) (work-in-progress)
- [routing between different views in my Angular application](recipes/angular/routing-in-angular-application#readme) (work-in-progress)

## Motivation

When discovering this library your first thought may have been: "Are you kidding me, yet another state management library?" That sentiment is perfectly understandable. There are many existing options for managing your state in web applications. If you are already using one of those and it works for you, then you should probably stick with it. However, **simplux** brings some unique points to the table that make it a worthwhile addition to the state management ecosystem:

- **excellent task-driven documentation:** a lot of effort went into writing our [recipes](#recipes). While most other libraries have documentation that is centered around explaining _what_ they do, our task-driven documentation is focused on showing you how **simplux** _helps you to solve your concrete tasks_. We also provide code sandboxes for every recipe that allow you to interact with the code while reading the recipe, which greatly improves the learning experience.

- **strong focus on testability:** testing is a very important topic that is sadly often neglected. **simplux** takes testability very seriously and makes sure that you know how you can test the code you have written using it (you may have noticed that the recipe immediately following [getting started](recipes/basics/getting-started#readme) in the list above already shows you how you can [test the code](recipes/basics/testing-state-changes#readme) from the first recipe).

- **optimized for TypeScript:** **simplux** is built with and for TypeScript. Sometimes TypeScript code can be a bit verbose. We put a lot of effort into ensuring that the amount of type annotations in your code is minimized by leveraging type inference wherever possible. That said **simplux** can also be used with plain JavaScript, in which case your IDE may still use the TypeScript information to help you due to our bundled typings.

- **out-of-the-box solutions for many common yet complex use-cases:** Have you ever tried setting up hot module reloading or code splitting with React and Redux? It can be quite tricky. **simplux** aims to solve as many of these complex use-cases by providing zero-configuration out-of-the-box solutions.

- **modular and extensible architecture:** Our core package only contains the bare minimum that is required to use **simplux**. All other advanced functionality is added via extension packages. On one hand this allows you to pick and choose what functionality you want to use without paying for anything that you don't. On the other hand it allows adding new extension packages without risk of breaking any existing functionality.

## Prior Art

This library was heavily inspired by [Rematch](https://rematch.gitbooks.io/rematch) and shares a lot of ideas with it.

## Open points

- core: remove `nameFunction` in production
- testing: add functions to throw when calling unmocked mutations or effects
- router: make navigation async
- router: add interceptor `onNavigateTo` to route configuration
- router: explicitly specify what happened in return value of `navigateTo`
- router: method `addRoutes` on `SimpluxRouter` to create multiple routes at once
- router: capture navigation history
- router: allow going back to previously active route
- router: allow creating child routes
- router: remove default parameter values
- router: add type tests
- browser-router: configuration parameter for setting URL at start or end of navigation (or not at all); also add these as navigation options
- browser-router: configuration parameter for replacing history entry; also add these as navigation options
- browser-router: allow ?[, [?, &[, and [& for optional query parameters
- browser-router: allow defining global query parameters
- browser-router: throw when creating conflicting route definition
- browser-router: add support for base href in history mode
- browser-router: add support for hash mode
- browser-router: allow defining default values for parameters (e.g. /:id:string|defaultValue/)
- browser-router: alternatively add function configuration parameter to fill in defaults dynamically (also infer correct full parameter type from return value of callback)
- entities: create package for managing collections of entities
- entities: create default set of entity management mutations
- entities: allow creating custom mutations that act on one entity
- entities: create default set of selectors for entities
- docs: create website
- recipes: add example effects to recipe for `creating non-trivial modules` and explicitly mention mixin pattern
- build: create root jest config to run tests of all projects at once
- build: switch to eslint

## Contributing

If you want to help with the development of this library please have a look at the [contributing guidelines](CONTRIBUTING.md).

## License

Everything in this repository is [licensed under the MIT License](LICENSE) unless otherwise specified.

Copyright (c) 2019-present Jonathan Ziller

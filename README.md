# simplux - redux made simple

**simplux** is a collection of libaries for frontend state management that require little to no boilerplate and are built with TypeScript in mind, all while giving you the full power of redux.

This repository is a work-in-progress and is not suitable for use in production.

## Recipes

Here you can find some recipes that will make it simple to learn how to use **simplux**.

### Basics

- [getting started](recipes/basics/getting-started#readme) ([code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/getting-started))
- [testing mutations](recipes/basics/testing-mutations#readme) ([code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/testing-mutations))
- [using derived state](recipes/basics/using-derived-state#readme) ([code sandbox](https://codesandbox.io/s/github/MrWolfZ/simplux/tree/master/recipes/basics/using-derived-state))

## Open points

- core: merge modules if defined multiple times, but print a warning during DEV mode
- core: add testing package that allows mocking mutations
- core: freeze module state in DEV mode
- selectors: add extension for creating factory selectors
- selectors: add testing package that allows mocking selectors
- selectors: add test to verify store is not eagerly accessed
- selectors: add basic memoization (also update derived state recipe with example of this)
- react: verify package works with react-native
- react: add test to verify store is not eagerly accessed
- async: create package for performing async work for a module
- async: add testing package that allows mocking async work
- async: add test to verify store is not eagerly accessed
- async: support cancelling work
- observable: create package for getting an observable of module state changes
- observable: add support for observable epics
- observable: add test to verify store is not eagerly accessed
- docs: create website
- docs: write docs for each package
- docs: explain how to use with and without existing store
- add dtslint tests
- add travis builds
- add code coverage builds
- add tests that verify HMR works
- add tests that verify server-side rendering works
- angular: create package for angular service
- presets: create preset packages that only contain package.json files that pull in all recommended packages
- update recipe readmes
- add recipes:
  - composing mutations
  - derived state
  - testing selectors
  - composing selectors
  - writing mutations with less boilerplate
  - usage with reselect
  - using with react and simplux extension
  - using with react and react-redux
  - testing react-component that selects state
  - testing react-component that mutates state

## Contributing

#### Commit Types

Must be one of the following:

- build: Changes that affect the build system or external dependencies (example scopes: rollup, npm)
- ci: Changes to our CI configuration files and scripts (example scopes: Travis)
- docs: Documentation only changes
- feat: A new feature
- fix: A bug fix
- perf: A code change that improves performance
- refactor: A code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- test: Adding missing tests or correcting existing tests

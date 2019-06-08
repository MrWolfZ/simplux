# simplux - redux made simple

**simplux** is state management as it should be: simple to use, no boilerplate, type-safe but not verbose - all while giving you the full power of redux.

[![npm version](https://badge.fury.io/js/%40simplux%2Fcore.svg)](https://www.npmjs.com/package/@simplux/core)
[![Build Status](https://travis-ci.org/MrWolfZ/simplux.svg?branch=master)](https://travis-ci.org/MrWolfZ/simplux)
[![codecov](https://codecov.io/gh/MrWolfZ/simplux/branch/master/graph/badge.svg)](https://codecov.io/gh/MrWolfZ/simplux)
[![license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This repository is a work-in-progress and is not suitable for use in production just yet.

## Recipes

Here are some recipes that will show you how **simplux** can make your life easier.

### Basics

- [getting started](recipes/basics/getting-started#readme)
- [testing state changes](recipes/basics/testing-state-changes#readme)
- [computing derived state](recipes/basics/computing-derived-state#readme)
- [testing derived state](recipes/basics/testing-derived-state#readme)
- [simplifying state changes](recipes/basics/simplifying-state-changes#readme)

### Advanced

- [using **simplux** in my application that already uses redux](recipes/advanced/using-in-redux-application#readme)
- [organizing my application state](recipes/advanced/organizing-application-state#readme)

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
- observable: add way to get observable of actions
- docs: create website
- docs: write docs for each package
- docs: explain how to use with and without existing store
- add dtslint tests (and add TypeScript peer dependencies to packages)
- add travis builds
- add code coverage builds
- add tests that verify HMR works
- add tests that verify server-side rendering works
- angular: create package for angular service
- core: add way to susbcribe to mutations (if a use case exists for this)
- core: add type to mutation extras
- add recipes:
  - reacting to state changes
  - debugging
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

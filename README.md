# simplux

**simplux** is a collection of libaries for frontend state management that require little to no boilerplate and are built with TypeScript in mind, all while giving you the full power of redux.

This repository is a work-in-progress and is not suitable for use in production.

### Open points

- core: add examples
- core: add testing package that allows mocking mutations
- selectors: add extension for creating factory selectors
- selectors: add testing package that allows mocking selectors
- selectors: add test to verify store is not eagerly accessed
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

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.18.0](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.13...v0.18.0) (2022-08-27)

**Note:** Version bump only for package @simplux/platform





# [0.18.0-alpha.13](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.12...v0.18.0-alpha.13) (2022-08-27)


### Bug Fixes

* **core:** do not memoize selector args when selector throws ([a982e61](https://github.com/MrWolfZ/simplux/commit/a982e6122af4ea9ec6108e4c7046fb6c27598228))


### Features

* **react:** upgrade to react 18 ([604c3cc](https://github.com/MrWolfZ/simplux/commit/604c3cca094343f55b5cec371cf7a08764011b38))





# [0.18.0-alpha.12](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.11...v0.18.0-alpha.12) (2021-01-02)


### Bug Fixes

* **browser-router:** fix `currentNavigationUrl` result if navigations are cancelled or rejected ([d10124e](https://github.com/MrWolfZ/simplux/commit/d10124ecc64a38b90ea79f2367b8051cba783a8a))
* **router:** fix `navigationIsInProgress` result if navigations are cancelled or rejected ([cd249ae](https://github.com/MrWolfZ/simplux/commit/cd249ae5fda1aa4391fa967120a667fa099bd820))





# [0.18.0-alpha.11](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.10...v0.18.0-alpha.11) (2021-01-01)


### Features

* **browser-router:** support adding child routes ([569bea2](https://github.com/MrWolfZ/simplux/commit/569bea268f3c8f920ddb86f9c71d5b063d62eef1))
* **router:** add property to `onNavigateTo` args to indicate whether navigation is to child route ([7982240](https://github.com/MrWolfZ/simplux/commit/798224024a9c301dda7305fedc01582c55d353e2))
* **router:** support adding child routes ([31ce3b7](https://github.com/MrWolfZ/simplux/commit/31ce3b747a21dbea3fecd55d95bd610f024df0b1))





# [0.18.0-alpha.10](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.9...v0.18.0-alpha.10) (2020-12-30)


### Features

* **browser-router:** support array parameters ([6564a7a](https://github.com/MrWolfZ/simplux/commit/6564a7ae8502ed9eb2ba81f751506c72b34f45c6))





# [0.18.0-alpha.9](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.8...v0.18.0-alpha.9) (2020-12-30)


### Features

* **browser-router:** allow `onNavigateTo` callbacks to cancel the navigation ([65c42b5](https://github.com/MrWolfZ/simplux/commit/65c42b5a3c12210dc0a25fedb88b5d5414304571))
* **router:** allow `onNavigateTo` callbacks to cancel the navigation ([00e81e1](https://github.com/MrWolfZ/simplux/commit/00e81e19449e2016900fee5eaa5a6c1554df76d7))


### Performance Improvements

* **browser-router:** memoize calls to `href` ([36e470f](https://github.com/MrWolfZ/simplux/commit/36e470fd9d8c4153d23c995fdeb5c72247dd7ab8))





# [0.18.0-alpha.8](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.7...v0.18.0-alpha.8) (2020-12-27)


### Features

* **router:** notify `onNavigateTo` if navigation is cancelled ([9989b1b](https://github.com/MrWolfZ/simplux/commit/9989b1b8426b3b9d383dab243ffc93ea80cfa991))





# [0.18.0-alpha.7](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.6...v0.18.0-alpha.7) (2020-12-27)


### Features

* **browser-router:** handle origin when navigating to URL ([67ba0df](https://github.com/MrWolfZ/simplux/commit/67ba0df6d0da278d09483d7c02effba1da0b9e46))
* **router:** add route configuration option for intercepting navigation ([fa4ca34](https://github.com/MrWolfZ/simplux/commit/fa4ca343eb9ad1ad624e1aff2b0753a91e8963dc))
* **router:** add selector to check if a navigation is in progress ([4c047fa](https://github.com/MrWolfZ/simplux/commit/4c047fa2fd7fb400efd57bd502fbe5b2aaad942e))





# [0.18.0-alpha.6](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.5...v0.18.0-alpha.6) (2020-12-26)


### Bug Fixes

* **browser-router:** fix error during activation ([0f721f6](https://github.com/MrWolfZ/simplux/commit/0f721f6b111e86497da7a800082e6d6254c00368))





# [0.18.0-alpha.5](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.4...v0.18.0-alpha.5) (2020-12-26)


### Bug Fixes

* **browser-router:** set url in location module when navigating by ID ([bc2e2b6](https://github.com/MrWolfZ/simplux/commit/bc2e2b62a815c9041df610f2ed4840169c7ac3a7))
* **react:** call mocked selectors in `useSimplux` hook ([c575d77](https://github.com/MrWolfZ/simplux/commit/c575d77077dcc933934734fe828ae63c81a7400c))
* **testing:** fix signature of `mockSelector` and add type tests ([b5348f8](https://github.com/MrWolfZ/simplux/commit/b5348f8807f23ecf613940c890c4c9cf602f15a1))


### Features

* **testing:** add function to mock selectors ([fded6f7](https://github.com/MrWolfZ/simplux/commit/fded6f770975925831143ca9b258ed427b32e22d))





# [0.18.0-alpha.4](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.3...v0.18.0-alpha.4) (2020-12-26)


### Bug Fixes

* **core:** do not throw if first argument for mutation is `undefined` ([04ae60a](https://github.com/MrWolfZ/simplux/commit/04ae60a67db81a0c867b4bc28d90462a27e07739))





# [0.18.0-alpha.3](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.2...v0.18.0-alpha.3) (2020-12-26)


### Bug Fixes

* **browser-router:** update browser location when navigating to route programmatically ([5f8bd58](https://github.com/MrWolfZ/simplux/commit/5f8bd58b41898ecbb290fb6302b9e4f650a996b8))
* **core:** fix mutations from module scope getting lost during app initialization ([81cc625](https://github.com/MrWolfZ/simplux/commit/81cc625eefbb0e091172f33455ecf862d1e58fe1))


### Features

* **browser-router:** add selector for checking if any route is active ([0f7c644](https://github.com/MrWolfZ/simplux/commit/0f7c644c2294df3f44123abc264f434a262d041c))
* **router:** add selector for checking if any route is active ([9ff3914](https://github.com/MrWolfZ/simplux/commit/9ff39140533655615384c0b581f1211104480a10))





# [0.18.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.1...v0.18.0-alpha.2) (2020-12-25)


### Bug Fixes

* **core:** ensure effect functions have the correct name ([4d6051e](https://github.com/MrWolfZ/simplux/commit/4d6051e8716d20296d2ae5e05875a77409351fcf))
* **core:** fix falsy first mutation argument being swallowed ([f5a0b70](https://github.com/MrWolfZ/simplux/commit/f5a0b70000507b4ea9fd5d9673de96ea22f7a191))


### Features

* **browser-router:** basic implementation for parsing templates and generating href strings ([9e3b586](https://github.com/MrWolfZ/simplux/commit/9e3b586da0b4f8bc2e7ece2d7612b6532c7f4ec5))
* **browser-router:** listen to browser location changes and push history entries ([fb54212](https://github.com/MrWolfZ/simplux/commit/fb542125afdcfa3494e1045ed7c0b6b48314047b))
* **browser-router:** navigate to route by URL ([9e5a2dd](https://github.com/MrWolfZ/simplux/commit/9e5a2dd50fd338e833f623b34263d8836d7c12cd))
* **router:** basic router implementation ([c226d20](https://github.com/MrWolfZ/simplux/commit/c226d206d770950adc9588ddf25da7e79eca5bba))
* **router:** make parameters for `navigateTo` optional if possible ([ea00dc5](https://github.com/MrWolfZ/simplux/commit/ea00dc5d777da96c7538050323f720c603fc6a78))





# [0.18.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.0...v0.18.0-alpha.1) (2020-12-23)

**Note:** Version bump only for package @simplux/platform





# [0.18.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.17.0...v0.18.0-alpha.0) (2020-12-23)


### Bug Fixes

* **core:** allow mutations and selectors to have their own tsdoc comments ([48a7a2c](https://github.com/MrWolfZ/simplux/commit/48a7a2cc46c48044e12be24535f932777622bcef))
* **core:** ensure effect type only uses function signature of passed effect function ([6f03c3e](https://github.com/MrWolfZ/simplux/commit/6f03c3e228c8bac52e25dc7b45916b3569f040e9))


### Features

* add export specifications to package definitions to allow direct esm imports ([05c11a2](https://github.com/MrWolfZ/simplux/commit/05c11a262434bb6deac7809f7d6a62012e18560a))





# [0.17.0](https://github.com/MrWolfZ/simplux/compare/v0.16.1-alpha.0...v0.17.0) (2020-12-19)


### Features

* **core:** remove internal types and functions from public API definitions ([c1e5adb](https://github.com/MrWolfZ/simplux/commit/c1e5adb669f3d483f577467c93327b7aaeeea820))





## [0.16.1-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.16.0...v0.16.1-alpha.0) (2020-12-19)

**Note:** Version bump only for package @simplux/platform





# [0.16.0](https://github.com/MrWolfZ/simplux/compare/v0.15.0...v0.16.0) (2020-12-18)


### Bug Fixes

* **core:** fix generic effects not working properly ([f089ccd](https://github.com/MrWolfZ/simplux/commit/f089ccdaa0cb7abf6ea1d51486f62929c0075444))


### Features

* **recipes:** update recipe for creating testable side effects to use new `createEffects` function ([d678f1c](https://github.com/MrWolfZ/simplux/commit/d678f1c25d1c463dd6059a4ff018265cdd7d44cd))





# [0.15.0](https://github.com/MrWolfZ/simplux/compare/v0.14.0...v0.15.0) (2020-12-18)


### Features

* **core:** add function for creating multiple named effects at once ([042c93a](https://github.com/MrWolfZ/simplux/commit/042c93a2ad16a02ba4d9b535843ee786d675c817))





# [0.14.0](https://github.com/MrWolfZ/simplux/compare/v0.13.0...v0.14.0) (2020-09-30)


### Bug Fixes

* **core:** handle arrays, sets, and maps properly in utility types "Mutable" and "Immutable" ([43c266e](https://github.com/MrWolfZ/simplux/commit/43c266e1898fdfba5de3923a14531543698e7fae))


### Features

* **core:** make `getState` and selector return values immutable ([5efebfd](https://github.com/MrWolfZ/simplux/commit/5efebfd6406d850d798353fd91cb47ea992d2694))
* **recipes:** add quickstart counter example ([e979c48](https://github.com/MrWolfZ/simplux/commit/e979c485436ce2ee188006647227c9e2a1c1ee39))
* **recipes:** add quickstart react example ([58588dc](https://github.com/MrWolfZ/simplux/commit/58588dc6818563b32f12eb560cf45eaf13ad1d3e))





# [0.13.0](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.8...v0.13.0) (2020-04-13)

**Note:** Version bump only for package @simplux/platform





# [0.13.0-alpha.8](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.7...v0.13.0-alpha.8) (2020-04-12)


### Bug Fixes

* **core:** properly infer mutation types for immutable state type ([ad26a85](https://github.com/MrWolfZ/simplux/commit/ad26a85))





# [0.13.0-alpha.7](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.6...v0.13.0-alpha.7) (2020-04-12)


### Bug Fixes

* **core:** ensure state parameter for mutations is always mutable ([3c13ee0](https://github.com/MrWolfZ/simplux/commit/3c13ee0))
* **core:** throw error if name is not provided when creating module ([90087ed](https://github.com/MrWolfZ/simplux/commit/90087ed))






# [0.13.0-alpha.6](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.5...v0.13.0-alpha.6) (2020-04-11)

**Note:** Version bump only for package @simplux/platform





# [0.13.0-alpha.5](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.4...v0.13.0-alpha.5) (2020-04-11)


### Features

**Note:** Version bump only for package @simplux/platform






# [0.13.0-alpha.4](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.3...v0.13.0-alpha.4) (2020-04-11)

**Note:** Version bump only for package @simplux/platform





# [0.13.0-alpha.3](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.2...v0.13.0-alpha.3) (2020-04-11)

**Note:** Version bump only for package @simplux/platform





# [0.13.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.1...v0.13.0-alpha.2) (2020-04-11)

**Note:** Version bump only for package @simplux/platform






# [0.13.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.13.0-alpha.0...v0.13.0-alpha.1) (2020-04-11)

**Note:** Version bump only for package @simplux/platform





# [0.13.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.12.0...v0.13.0-alpha.0) (2020-04-11)


### Features

* **core:** remove invariant checks from production bundle ([cd66ab3](https://github.com/MrWolfZ/simplux/commit/cd66ab3))





# [0.12.0](https://github.com/MrWolfZ/simplux/compare/v0.11.1...v0.12.0) (2020-04-05)


### Features

* **core:** add function `isSimpluxModule` to check if an object is a simplux module ([da621f6](https://github.com/MrWolfZ/simplux/commit/da621f6))
* **core:** add shorthand overload for for `createSimpluxModule` ([baecf36](https://github.com/MrWolfZ/simplux/commit/baecf36))
* **react:** add overload for `useSimplux` that selects a module's value with an inline selector ([0f8d917](https://github.com/MrWolfZ/simplux/commit/0f8d917))
* **react:** add overload for `useSimplux` that selects a module's value without selector ([8f7745e](https://github.com/MrWolfZ/simplux/commit/8f7745e))





# [0.11.0](https://github.com/MrWolfZ/simplux/compare/v0.10.2...v0.11.0) (2019-12-15)


### Features

* **core:** memoize selector results ([c7e0787](https://github.com/MrWolfZ/simplux/commit/c7e0787))
* **recipes/advanced/communicating-between-modules:** add new recipe ([57dd921](https://github.com/MrWolfZ/simplux/commit/57dd921))
* **recipes/react/using-hot-module-reloading:** add recipe ([13e09a9](https://github.com/MrWolfZ/simplux/commit/13e09a9))
* **recipes/react/using-lazy-loading-code-splitting:** add recipe ([2a06b58](https://github.com/MrWolfZ/simplux/commit/2a06b58))





## [0.10.2](https://github.com/MrWolfZ/simplux/compare/v0.10.2-alpha.0...v0.10.2) (2019-11-25)

**Note:** Version bump only for package @simplux/platform





## [0.10.2-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.10.1...v0.10.2-alpha.0) (2019-11-25)

**Note:** Version bump only for package @simplux/platform





## [0.10.1](https://github.com/MrWolfZ/simplux/compare/v0.10.0...v0.10.1) (2019-11-25)


### Performance Improvements

* **react:** in provider only call module subscribers if the module's state has changed ([2543897](https://github.com/MrWolfZ/simplux/commit/2543897))
* **react:** reduce the number of times a component needs to resubscribe to the store ([c76aa37](https://github.com/MrWolfZ/simplux/commit/c76aa37))





# [0.10.0](https://github.com/MrWolfZ/simplux/compare/v0.10.0-alpha.2...v0.10.0) (2019-11-24)

**Note:** Version bump only for package @simplux/platform





# [0.10.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.10.0-alpha.1...v0.10.0-alpha.2) (2019-11-24)

**Note:** Version bump only for package @simplux/platform





# [0.10.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.10.0-alpha.0...v0.10.0-alpha.1) (2019-11-24)

**Note:** Version bump only for package @simplux/platform





# [0.10.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.9.0...v0.10.0-alpha.0) (2019-11-24)


### Bug Fixes

* **core:** ensure immer reducer keeps working if invocation of reducer throws ([f0e87eb](https://github.com/MrWolfZ/simplux/commit/f0e87eb))
* **testing:** clear state mocks when clearing all simplux mocks ([faf7e11](https://github.com/MrWolfZ/simplux/commit/faf7e11))


### Features

* **core:** add options argument to `subscribeToStateChanges` to allow skipping initial invocation ([f096b98](https://github.com/MrWolfZ/simplux/commit/f096b98))
* **preset:** add default preset package for simple installation ([4b97dd8](https://github.com/MrWolfZ/simplux/commit/4b97dd8))
* **preset-angular:** add preset package for Angular ([70ef486](https://github.com/MrWolfZ/simplux/commit/70ef486))
* **preset-react:** add preset package for React ([94b5920](https://github.com/MrWolfZ/simplux/commit/94b5920))
* **react:** memoize selector result in `useSimplux` ([4e7edcc](https://github.com/MrWolfZ/simplux/commit/4e7edcc))
* **react:** replace `createSelectorHook` with `useSimplux` ([7ae26b5](https://github.com/MrWolfZ/simplux/commit/7ae26b5))
* **testing:** return a tuple of handler and clear function from `mockMutation` and `mockEffect` ([f20382c](https://github.com/MrWolfZ/simplux/commit/f20382c))





# [0.9.0](https://github.com/MrWolfZ/simplux/compare/v0.9.0-alpha.0...v0.9.0) (2019-09-15)


### Bug Fixes

* **core:** fix erroneous absolute reference ([c7988d1](https://github.com/MrWolfZ/simplux/commit/c7988d1))
* **testing:** add missing export ([0f44b67](https://github.com/MrWolfZ/simplux/commit/0f44b67))
* **testing:** properly clear effect mocks when clearing all mocks ([1ae4c45](https://github.com/MrWolfZ/simplux/commit/1ae4c45))


### Features

* **core:** prevent accidentally dispatching a mutation from within another mutation ([9644645](https://github.com/MrWolfZ/simplux/commit/9644645))
* **recipes:** add recipe for "performing side effects" ([fe62e80](https://github.com/MrWolfZ/simplux/commit/fe62e80))
* **recipes:** add recipe for "testing my code that triggers side effects" ([23ad484](https://github.com/MrWolfZ/simplux/commit/23ad484))
* **recipes:** add recipe for "testing my side effects" ([67002f5](https://github.com/MrWolfZ/simplux/commit/67002f5))
* **testing:** allow mocking effects ([4155efe](https://github.com/MrWolfZ/simplux/commit/4155efe))





# [0.9.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.8.0...v0.9.0-alpha.0) (2019-09-15)


### Bug Fixes

* **core:** prevent functions from being used as mutation arguments ([945441e](https://github.com/MrWolfZ/simplux/commit/945441e))


### Features

* **core:** allow creating effects ([57c921a](https://github.com/MrWolfZ/simplux/commit/57c921a))
* **core:** allow listening to other module's mutations ([f0b5505](https://github.com/MrWolfZ/simplux/commit/f0b5505))





# [0.8.0](https://github.com/MrWolfZ/simplux/compare/v0.8.0-alpha.2...v0.8.0) (2019-06-26)

**Note:** Version bump only for package @simplux/platform





# [0.8.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.8.0-alpha.1...v0.8.0-alpha.2) (2019-06-26)

**Note:** Version bump only for package @simplux/platform





# [0.8.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.8.0-alpha.0...v0.8.0-alpha.1) (2019-06-26)

**Note:** Version bump only for package @simplux/platform





# [0.8.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.7.0...v0.8.0-alpha.0) (2019-06-26)


### Features

* **core:** add selectors functionality to core package ([40a820f](https://github.com/MrWolfZ/simplux/commit/40a820f))





# [0.7.0](https://github.com/MrWolfZ/simplux/compare/v0.7.0-alpha.4...v0.7.0) (2019-06-26)


### Features

* **recipes:** add recipe for "testing my Angular components" ([34eb7a5](https://github.com/MrWolfZ/simplux/commit/34eb7a5))
* **recipes:** add recipe for "using simplux in my Angular application" ([5697f84](https://github.com/MrWolfZ/simplux/commit/5697f84))





# [0.7.0-alpha.4](https://github.com/MrWolfZ/simplux/compare/v0.7.0-alpha.3...v0.7.0-alpha.4) (2019-06-25)


### Features

* **angular:** add method to service base for observing all state changes ([a847d68](https://github.com/MrWolfZ/simplux/commit/a847d68))





# [0.7.0-alpha.3](https://github.com/MrWolfZ/simplux/compare/v0.7.0-alpha.2...v0.7.0-alpha.3) (2019-06-25)

**Note:** Version bump only for package @simplux/platform





# [0.7.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.7.0-alpha.1...v0.7.0-alpha.2) (2019-06-25)


### Features

* **angular:** create package for using simplux in angular applications ([00fb2a8](https://github.com/MrWolfZ/simplux/commit/00fb2a8))





# [0.7.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.7.0-alpha.0...v0.7.0-alpha.1) (2019-06-24)


### Bug Fixes

* **core:** ensure destructuring subscription does not conflict with type inference ([592d8a2](https://github.com/MrWolfZ/simplux/commit/592d8a2))





# [0.7.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.6.0...v0.7.0-alpha.0) (2019-06-24)


### Features

* **async:** create extension package for adding asynchronous tasks to modules ([af68996](https://github.com/MrWolfZ/simplux/commit/af68996))
* **core:** return handler when subscribing to state changes to make testing simpler ([257f2df](https://github.com/MrWolfZ/simplux/commit/257f2df))
* **recipes:** add recipe for "reacting to state changes" ([b6ac371](https://github.com/MrWolfZ/simplux/commit/b6ac371))
* **testing:** add mocking support for async tasks ([4a0d417](https://github.com/MrWolfZ/simplux/commit/4a0d417))





# 0.6.0 (2019-06-23)


### Bug Fixes

* **react:** fix incorrect signature for handlers in subscriber batching ([69f20ab](https://github.com/MrWolfZ/simplux/commit/69f20ab))


### Features

* **core:** provide previous state as second arg to state change listeners for easier state diffing ([5561e63](https://github.com/MrWolfZ/simplux/commit/5561e63))
* **recipes:** add recipe for "creating non-trivial modules" ([5b8ba4e](https://github.com/MrWolfZ/simplux/commit/5b8ba4e))



# 0.6.0-alpha.3 (2019-06-22)


### Bug Fixes

* **core-testing:** fix multiple module mutation mocks interfering with each other ([b19ba6a](https://github.com/MrWolfZ/simplux/commit/b19ba6a))


### Features

* **core:** add support for mocking module state ([d546989](https://github.com/MrWolfZ/simplux/commit/d546989))
* **core:** add support for writing mutable/immer-style mutations ([4cc1af0](https://github.com/MrWolfZ/simplux/commit/4cc1af0))
* **core:** call subscriber immediately with current module state when subscribing ([ed04c47](https://github.com/MrWolfZ/simplux/commit/ed04c47))
* **core-testing:** add new function `mockModuleState` that allows mocking a module's state ([7d8fd90](https://github.com/MrWolfZ/simplux/commit/7d8fd90))
* **observe:** add observe extension package that allows subscribing to module changes with RxJS ([f518bfa](https://github.com/MrWolfZ/simplux/commit/f518bfa))
* **recipes:** add example for class component to "using simplux in my React application" ([5ecc088](https://github.com/MrWolfZ/simplux/commit/5ecc088))
* **recipes:** add recipe for "organizing my application state" ([0dd07b5](https://github.com/MrWolfZ/simplux/commit/0dd07b5))
* **recipes:** add text version of "testing my React components that read and change state" ([13b9b86](https://github.com/MrWolfZ/simplux/commit/13b9b86))
* **recipes:** use explicit mocking functions instead of members in "test components using state" ([463685b](https://github.com/MrWolfZ/simplux/commit/463685b))


### Performance Improvements

* **core:** optimize mutation performance by reducing number of string operations during evaluation ([9f6fc54](https://github.com/MrWolfZ/simplux/commit/9f6fc54))



# 0.6.0-alpha.2 (2019-06-11)


### Features

* **react:** add module name as property to selector hook ([c6b1897](https://github.com/MrWolfZ/simplux/commit/c6b1897))
* **react-testing:** use explicit functions instead of members for mocking selector hook states ([bb954f8](https://github.com/MrWolfZ/simplux/commit/bb954f8))



# 0.6.0-alpha.1 (2019-06-11)


### Features

* **core:** add a unique type identifier to each mutation ([7994d22](https://github.com/MrWolfZ/simplux/commit/7994d22))
* **recipes:** add example for using selector as factory in "testing components using state" ([38dea9c](https://github.com/MrWolfZ/simplux/commit/38dea9c))
* **recipes:** add example for using selector as factory in "using in React application" ([9fb5955](https://github.com/MrWolfZ/simplux/commit/9fb5955))



# 0.6.0-alpha.0 (2019-06-11)


### Features

* **recipes:** add code for new react recipe "testing components using state" ([a2e8e4e](https://github.com/MrWolfZ/simplux/commit/a2e8e4e))
* **selectors:** allow calling selector as a factory to return a selector that just takes the state ([062cd60](https://github.com/MrWolfZ/simplux/commit/062cd60))



# 0.5.0 (2019-06-10)


### Features

* **react:** allow other extensions to add functionality to module selector hook ([1184324](https://github.com/MrWolfZ/simplux/commit/1184324))
* **react-testing:** add new extension package for testing with React ([4721323](https://github.com/MrWolfZ/simplux/commit/4721323))
* **recipes:** add recipe for "testing my code that uses mutations" ([5c81615](https://github.com/MrWolfZ/simplux/commit/5c81615))



# 0.5.0-alpha.0 (2019-06-10)


### Features

* **core-testing:** allow controlling how often a mutation will be mocked ([aa340e7](https://github.com/MrWolfZ/simplux/commit/aa340e7))



## 0.4.3-alpha.0 (2019-06-10)



## 0.4.2 (2019-06-10)



## 0.4.1 (2019-06-10)


### Bug Fixes

* **core:** ignore "accidental" mutation args that are HTML events ([6776d7a](https://github.com/MrWolfZ/simplux/commit/6776d7a))
* **core-testing:** add missing API exports ([af4bbd8](https://github.com/MrWolfZ/simplux/commit/af4bbd8))



# 0.4.0 (2019-06-09)


### Bug Fixes

* **recipes:** add missing dependency for "composing mutations" ([5279cbd](https://github.com/MrWolfZ/simplux/commit/5279cbd))


### Features

* **core:** allow to specify order when registering module extension which allows composition ([d352c95](https://github.com/MrWolfZ/simplux/commit/d352c95))
* **core-testing:** add new extension package "core-testing" ([05c194e](https://github.com/MrWolfZ/simplux/commit/05c194e))
* **recipes:** add recipe for "composing selectors" ([b7ef2f6](https://github.com/MrWolfZ/simplux/commit/b7ef2f6))
* **recipes:** add recipe for "debugging with Redux DevTools" ([d5fbe1f](https://github.com/MrWolfZ/simplux/commit/d5fbe1f))
* **recipes:** add recipe for "using simplux in my React application" ([cb2818d](https://github.com/MrWolfZ/simplux/commit/cb2818d))
* **recipes:** improve "debugging with Redux DevTools" recipe ([0de089b](https://github.com/MrWolfZ/simplux/commit/0de089b))



# 0.3.0 (2019-06-09)


### Features

* **recipes:** add recipe for "composing mutations" ([46cdb4b](https://github.com/MrWolfZ/simplux/commit/46cdb4b))



# 0.3.0-alpha.4 (2019-06-09)


### Bug Fixes

* **core:** ensure module state is set in redux store when module is created ([cd53ac9](https://github.com/MrWolfZ/simplux/commit/cd53ac9))
* **immer:** ensure composing mutations works correctly ([ecff6a0](https://github.com/MrWolfZ/simplux/commit/ecff6a0))
* **recipes:** add missing dependency to "simplifying state changes" recipe ([8931146](https://github.com/MrWolfZ/simplux/commit/8931146))
* **recipes:** fix "testing derived state" not working correctly in code sandbox ([97fc902](https://github.com/MrWolfZ/simplux/commit/97fc902))


### Features

* **core:** freeze state during mutations in development mode ([6fc9786](https://github.com/MrWolfZ/simplux/commit/6fc9786))
* **recipes:** add recipe for "simplifying state changes" ([7c77384](https://github.com/MrWolfZ/simplux/commit/7c77384))
* **recipes:** add recipe for "testing derived state" ([61418c3](https://github.com/MrWolfZ/simplux/commit/61418c3))
* **recipes:** add recipe for "using simplux in my application that already uses Redux" ([eb9e1f7](https://github.com/MrWolfZ/simplux/commit/eb9e1f7))



# 0.3.0-alpha.3 (2019-06-08)


### Features

* **recipes:** add text version of "computing derived state" recipe ([8866d53](https://github.com/MrWolfZ/simplux/commit/8866d53))
* **recipes:** make "testing state changes" recipe simpler and add text version ([d3b7029](https://github.com/MrWolfZ/simplux/commit/d3b7029))
* **selectors:** ensure compatibility with TypeScript 3.3 ([e920de9](https://github.com/MrWolfZ/simplux/commit/e920de9))



# 0.3.0-alpha.2 (2019-06-05)


### Bug Fixes

* **core:** ensure mutation type inference works with TypeScript 3.3.3 ([4da619a](https://github.com/MrWolfZ/simplux/commit/4da619a))


### Features

* **core:** automatically create redux store for simple scenarios ([0d2ac13](https://github.com/MrWolfZ/simplux/commit/0d2ac13))
* **recipes:** add text version of "getting started" recipe ([24f21dc](https://github.com/MrWolfZ/simplux/commit/24f21dc))
* **recipes:** simplify "getting started" recipe ([aed2ca4](https://github.com/MrWolfZ/simplux/commit/aed2ca4))



# 0.3.0-alpha.1 (2019-06-02)


### Bug Fixes

* **core:** ensure mutation functions have the correct name ([91ace5a](https://github.com/MrWolfZ/simplux/commit/91ace5a))
* **selectors:** ensure selector functions have the correct name ([a352bda](https://github.com/MrWolfZ/simplux/commit/a352bda))



# 0.3.0-alpha.0 (2019-06-02)


### Bug Fixes

* **immer:** add missing exports to public API ([87d406a](https://github.com/MrWolfZ/simplux/commit/87d406a))
* **react:** add missing exports to public API ([08226e9](https://github.com/MrWolfZ/simplux/commit/08226e9))
* **selectors:** add missing exports to public API ([d8c3513](https://github.com/MrWolfZ/simplux/commit/d8c3513))


### Features

* **react:** use react batching to notify module selector hooks ([d83dc43](https://github.com/MrWolfZ/simplux/commit/d83dc43))



## 0.2.3-alpha.0 (2019-06-02)



## 0.2.2 (2019-06-02)



## 0.2.1 (2019-06-02)



# 0.2.0 (2019-06-02)


### Bug Fixes

* **core:** add missing export ([4a04651](https://github.com/MrWolfZ/simplux/commit/4a04651))


### Features

* **core:** allow calling mutation as action creator ([86325a7](https://github.com/MrWolfZ/simplux/commit/86325a7))
* **core:** allow subscribing to module state changes ([510a0b2](https://github.com/MrWolfZ/simplux/commit/510a0b2))
* **core:** pass module core to extensions ([2604030](https://github.com/MrWolfZ/simplux/commit/2604030))
* **core:** require external redux store to be provided ([3586d98](https://github.com/MrWolfZ/simplux/commit/3586d98))
* **recipes:** add getting-started recipe ([4a7ec45](https://github.com/MrWolfZ/simplux/commit/4a7ec45))
* **selectors:** throw when existing selector is declared again ([8e81a71](https://github.com/MrWolfZ/simplux/commit/8e81a71))






# [0.6.0-alpha.3](https://github.com/MrWolfZ/simplux/compare/v0.6.0-alpha.2...v0.6.0-alpha.3) (2019-06-22)


### Bug Fixes

* **core-testing:** fix multiple module mutation mocks interfering with each other ([b19ba6a](https://github.com/MrWolfZ/simplux/commit/b19ba6a))


### Features

* **core:** add support for mocking module state ([d546989](https://github.com/MrWolfZ/simplux/commit/d546989))
* **core:** add support for writing mutable/immer-style mutations ([4cc1af0](https://github.com/MrWolfZ/simplux/commit/4cc1af0))
* **core:** call subscriber immediately with current module state when subscribing ([ed04c47](https://github.com/MrWolfZ/simplux/commit/ed04c47))
* **core-testing:** add new function `mockModuleState` that allows mocking a module's state ([7d8fd90](https://github.com/MrWolfZ/simplux/commit/7d8fd90))
* **observe:** add observe extension package that allows subscribing to module changes with RxJS ([f518bfa](https://github.com/MrWolfZ/simplux/commit/f518bfa))
* **recipes:** add example for class component to "using simplux in my React application" ([5ecc088](https://github.com/MrWolfZ/simplux/commit/5ecc088))
* **recipes:** add recipe for "organizing my application state" ([0dd07b5](https://github.com/MrWolfZ/simplux/commit/0dd07b5))
* **recipes:** add text version of "testing my React components that read and change state" ([13b9b86](https://github.com/MrWolfZ/simplux/commit/13b9b86))
* **recipes:** use explicit mocking functions instead of members in "test components using state" ([463685b](https://github.com/MrWolfZ/simplux/commit/463685b))


### Performance Improvements

* **core:** optimize mutation performance by reducing number of string operations during evaluation ([9f6fc54](https://github.com/MrWolfZ/simplux/commit/9f6fc54))





# [0.6.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.6.0-alpha.1...v0.6.0-alpha.2) (2019-06-11)


### Features

* **react:** add module name as property to selector hook ([c6b1897](https://github.com/MrWolfZ/simplux/commit/c6b1897))
* **react-testing:** use explicit functions instead of members for mocking selector hook states ([bb954f8](https://github.com/MrWolfZ/simplux/commit/bb954f8))





# [0.6.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.6.0-alpha.0...v0.6.0-alpha.1) (2019-06-11)


### Features

* **core:** add a unique type identifier to each mutation ([7994d22](https://github.com/MrWolfZ/simplux/commit/7994d22))
* **recipes:** add example for using selector as factory in "testing components using state" ([38dea9c](https://github.com/MrWolfZ/simplux/commit/38dea9c))
* **recipes:** add example for using selector as factory in "using in React application" ([9fb5955](https://github.com/MrWolfZ/simplux/commit/9fb5955))





# [0.6.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.5.0...v0.6.0-alpha.0) (2019-06-11)


### Features

* **recipes:** add code for new react recipe "testing components using state" ([a2e8e4e](https://github.com/MrWolfZ/simplux/commit/a2e8e4e))
* **selectors:** allow calling selector as a factory to return a selector that just takes the state ([062cd60](https://github.com/MrWolfZ/simplux/commit/062cd60))





# [0.5.0](https://github.com/MrWolfZ/simplux/compare/v0.5.0-alpha.0...v0.5.0) (2019-06-10)


### Features

* **react:** allow other extensions to add functionality to module selector hook ([1184324](https://github.com/MrWolfZ/simplux/commit/1184324))
* **react-testing:** add new extension package for testing with React ([4721323](https://github.com/MrWolfZ/simplux/commit/4721323))
* **recipes:** add recipe for "testing my code that uses mutations" ([5c81615](https://github.com/MrWolfZ/simplux/commit/5c81615))





# [0.5.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.4.3-alpha.0...v0.5.0-alpha.0) (2019-06-10)


### Features

* **core-testing:** allow controlling how often a mutation will be mocked ([aa340e7](https://github.com/MrWolfZ/simplux/commit/aa340e7))





## [0.4.3-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.4.2...v0.4.3-alpha.0) (2019-06-10)

**Note:** Version bump only for package @simplux/platform





## [0.4.2](https://github.com/MrWolfZ/simplux/compare/v0.4.1...v0.4.2) (2019-06-10)

**Note:** Version bump only for package @simplux/platform





## [0.4.1](https://github.com/MrWolfZ/simplux/compare/v0.4.0...v0.4.1) (2019-06-10)


### Bug Fixes

* **core:** ignore "accidental" mutation args that are HTML events ([6776d7a](https://github.com/MrWolfZ/simplux/commit/6776d7a))
* **core-testing:** add missing API exports ([af4bbd8](https://github.com/MrWolfZ/simplux/commit/af4bbd8))





# [0.4.0](https://github.com/MrWolfZ/simplux/compare/v0.3.0...v0.4.0) (2019-06-09)


### Bug Fixes

* **recipes:** add missing dependency for "composing mutations" ([5279cbd](https://github.com/MrWolfZ/simplux/commit/5279cbd))


### Features

* **core:** allow to specify order when registering module extension which allows composition ([d352c95](https://github.com/MrWolfZ/simplux/commit/d352c95))
* **core-testing:** add new extension package "core-testing" ([05c194e](https://github.com/MrWolfZ/simplux/commit/05c194e))
* **recipes:** add recipe for "composing selectors" ([b7ef2f6](https://github.com/MrWolfZ/simplux/commit/b7ef2f6))
* **recipes:** add recipe for "debugging with Redux DevTools" ([d5fbe1f](https://github.com/MrWolfZ/simplux/commit/d5fbe1f))
* **recipes:** add recipe for "using simplux in my React application" ([cb2818d](https://github.com/MrWolfZ/simplux/commit/cb2818d))
* **recipes:** improve "debugging with Redux DevTools" recipe ([0de089b](https://github.com/MrWolfZ/simplux/commit/0de089b))





# [0.3.0](https://github.com/MrWolfZ/simplux/compare/v0.3.0-alpha.4...v0.3.0) (2019-06-09)


### Features

* **recipes:** add recipe for "composing mutations" ([46cdb4b](https://github.com/MrWolfZ/simplux/commit/46cdb4b))





# [0.3.0-alpha.4](https://github.com/MrWolfZ/simplux/compare/v0.3.0-alpha.3...v0.3.0-alpha.4) (2019-06-09)


### Bug Fixes

* **core:** ensure module state is set in redux store when module is created ([cd53ac9](https://github.com/MrWolfZ/simplux/commit/cd53ac9))
* **immer:** ensure composing mutations works correctly ([ecff6a0](https://github.com/MrWolfZ/simplux/commit/ecff6a0))
* **recipes:** add missing dependency to "simplifying state changes" recipe ([8931146](https://github.com/MrWolfZ/simplux/commit/8931146))
* **recipes:** fix "testing derived state" not working correctly in code sandbox ([97fc902](https://github.com/MrWolfZ/simplux/commit/97fc902))


### Features

* **core:** freeze state during mutations in development mode ([6fc9786](https://github.com/MrWolfZ/simplux/commit/6fc9786))
* **recipes:** add recipe for "simplifying state changes" ([7c77384](https://github.com/MrWolfZ/simplux/commit/7c77384))
* **recipes:** add recipe for "testing derived state" ([61418c3](https://github.com/MrWolfZ/simplux/commit/61418c3))
* **recipes:** add recipe for "using simplux in my application that already uses Redux" ([eb9e1f7](https://github.com/MrWolfZ/simplux/commit/eb9e1f7))





# [0.3.0-alpha.3](https://github.com/MrWolfZ/simplux/compare/v0.3.0-alpha.2...v0.3.0-alpha.3) (2019-06-08)


### Features

* **recipes:** add text version of "computing derived state" recipe ([8866d53](https://github.com/MrWolfZ/simplux/commit/8866d53))
* **recipes:** make "testing state changes" recipe simpler and add text version ([d3b7029](https://github.com/MrWolfZ/simplux/commit/d3b7029))
* **selectors:** ensure compatibility with TypeScript 3.3 ([e920de9](https://github.com/MrWolfZ/simplux/commit/e920de9))





# [0.3.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.3.0-alpha.1...v0.3.0-alpha.2) (2019-06-05)


### Bug Fixes

* **core:** ensure mutation type inference works with TypeScript 3.3.3 ([4da619a](https://github.com/MrWolfZ/simplux/commit/4da619a))


### Features

* **core:** automatically create redux store for simple scenarios ([0d2ac13](https://github.com/MrWolfZ/simplux/commit/0d2ac13))
* **recipes:** add text version of "getting started" recipe ([24f21dc](https://github.com/MrWolfZ/simplux/commit/24f21dc))
* **recipes:** simplify "getting started" recipe ([aed2ca4](https://github.com/MrWolfZ/simplux/commit/aed2ca4))





# [0.3.0-alpha.1](https://github.com/MrWolfZ/simplux/compare/v0.3.0-alpha.0...v0.3.0-alpha.1) (2019-06-02)


### Bug Fixes

* **core:** ensure mutation functions have the correct name ([91ace5a](https://github.com/MrWolfZ/simplux/commit/91ace5a))
* **selectors:** ensure selector functions have the correct name ([a352bda](https://github.com/MrWolfZ/simplux/commit/a352bda))





# [0.3.0-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.2.3-alpha.0...v0.3.0-alpha.0) (2019-06-02)


### Bug Fixes

* **immer:** add missing exports to public API ([87d406a](https://github.com/MrWolfZ/simplux/commit/87d406a))
* **react:** add missing exports to public API ([08226e9](https://github.com/MrWolfZ/simplux/commit/08226e9))
* **selectors:** add missing exports to public API ([d8c3513](https://github.com/MrWolfZ/simplux/commit/d8c3513))


### Features

* **react:** use react batching to notify module selector hooks ([d83dc43](https://github.com/MrWolfZ/simplux/commit/d83dc43))





## [0.2.3-alpha.0](https://github.com/MrWolfZ/simplux/compare/v0.2.2...v0.2.3-alpha.0) (2019-06-02)

**Note:** Version bump only for package @simplux/platform





## [0.2.2](https://github.com/MrWolfZ/simplux/compare/v0.2.1...v0.2.2) (2019-06-02)

**Note:** Version bump only for package @simplux/platform





## [0.2.1](https://github.com/MrWolfZ/simplux/compare/v0.2.0...v0.2.1) (2019-06-02)

**Note:** Version bump only for package @simplux/platform

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.18.0](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.13...v0.18.0) (2022-08-27)

**Note:** Version bump only for package @simplux/browser-router





# [0.18.0-alpha.13](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.12...v0.18.0-alpha.13) (2022-08-27)

**Note:** Version bump only for package @simplux/browser-router





# [0.18.0-alpha.12](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.11...v0.18.0-alpha.12) (2021-01-02)


### Bug Fixes

* **browser-router:** fix `currentNavigationUrl` result if navigations are cancelled or rejected ([d10124e](https://github.com/MrWolfZ/simplux/commit/d10124ecc64a38b90ea79f2367b8051cba783a8a))





# [0.18.0-alpha.11](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.10...v0.18.0-alpha.11) (2021-01-01)


### Features

* **browser-router:** support adding child routes ([569bea2](https://github.com/MrWolfZ/simplux/commit/569bea268f3c8f920ddb86f9c71d5b063d62eef1))





# [0.18.0-alpha.10](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.9...v0.18.0-alpha.10) (2020-12-30)


### Features

* **browser-router:** support array parameters ([6564a7a](https://github.com/MrWolfZ/simplux/commit/6564a7ae8502ed9eb2ba81f751506c72b34f45c6))





# [0.18.0-alpha.9](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.8...v0.18.0-alpha.9) (2020-12-30)


### Features

* **browser-router:** allow `onNavigateTo` callbacks to cancel the navigation ([65c42b5](https://github.com/MrWolfZ/simplux/commit/65c42b5a3c12210dc0a25fedb88b5d5414304571))


### Performance Improvements

* **browser-router:** memoize calls to `href` ([36e470f](https://github.com/MrWolfZ/simplux/commit/36e470fd9d8c4153d23c995fdeb5c72247dd7ab8))





# [0.18.0-alpha.8](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.7...v0.18.0-alpha.8) (2020-12-27)

**Note:** Version bump only for package @simplux/browser-router





# [0.18.0-alpha.7](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.6...v0.18.0-alpha.7) (2020-12-27)


### Features

* **browser-router:** handle origin when navigating to URL ([67ba0df](https://github.com/MrWolfZ/simplux/commit/67ba0df6d0da278d09483d7c02effba1da0b9e46))
* **router:** add route configuration option for intercepting navigation ([fa4ca34](https://github.com/MrWolfZ/simplux/commit/fa4ca343eb9ad1ad624e1aff2b0753a91e8963dc))





# [0.18.0-alpha.6](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.5...v0.18.0-alpha.6) (2020-12-26)


### Bug Fixes

* **browser-router:** fix error during activation ([0f721f6](https://github.com/MrWolfZ/simplux/commit/0f721f6b111e86497da7a800082e6d6254c00368))





# [0.18.0-alpha.5](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.4...v0.18.0-alpha.5) (2020-12-26)


### Bug Fixes

* **browser-router:** set url in location module when navigating by ID ([bc2e2b6](https://github.com/MrWolfZ/simplux/commit/bc2e2b62a815c9041df610f2ed4840169c7ac3a7))





# [0.18.0-alpha.4](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.3...v0.18.0-alpha.4) (2020-12-26)

**Note:** Version bump only for package @simplux/browser-router





# [0.18.0-alpha.3](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.2...v0.18.0-alpha.3) (2020-12-26)


### Bug Fixes

* **browser-router:** update browser location when navigating to route programmatically ([5f8bd58](https://github.com/MrWolfZ/simplux/commit/5f8bd58b41898ecbb290fb6302b9e4f650a996b8))


### Features

* **browser-router:** add selector for checking if any route is active ([0f7c644](https://github.com/MrWolfZ/simplux/commit/0f7c644c2294df3f44123abc264f434a262d041c))
* **router:** add selector for checking if any route is active ([9ff3914](https://github.com/MrWolfZ/simplux/commit/9ff39140533655615384c0b581f1211104480a10))





# [0.18.0-alpha.2](https://github.com/MrWolfZ/simplux/compare/v0.18.0-alpha.1...v0.18.0-alpha.2) (2020-12-25)


### Features

* **browser-router:** basic implementation for parsing templates and generating href strings ([9e3b586](https://github.com/MrWolfZ/simplux/commit/9e3b586da0b4f8bc2e7ece2d7612b6532c7f4ec5))
* **browser-router:** listen to browser location changes and push history entries ([fb54212](https://github.com/MrWolfZ/simplux/commit/fb542125afdcfa3494e1045ed7c0b6b48314047b))
* **browser-router:** navigate to route by URL ([9e5a2dd](https://github.com/MrWolfZ/simplux/commit/9e5a2dd50fd338e833f623b34263d8836d7c12cd))

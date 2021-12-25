# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/jorgenkg/nodejs-yale-doorman/compare/v2.0.0...v3.0.0) (2021-12-25)


### ⚠ BREAKING CHANGES

* Removes SDK response objects from lockDoor() and unlockDoor().
This change also introduce parsing of lock/unlock command success status from the
Yale API response body. The lock methods throw if the returned status code is not equal
to the success code "000".

### Bug Fixes

* parse api success code from response body ([95d90e6](https://github.com/jorgenkg/nodejs-yale-doorman/commit/95d90e6045a7a7eb7b296da255bbb3f452e233a7))

## [2.0.0](https://github.com/jorgenkg/nodejs-yale-doorman/compare/v1.1.0...v2.0.0) (2021-12-25)


### ⚠ BREAKING CHANGES

* Renamed the lock state enum LockStates to LockState.

### Bug Fixes

* add missing client credentials and rename LockStates -> LockState ([1cc591f](https://github.com/jorgenkg/nodejs-yale-doorman/commit/1cc591f77f2c35cf13cec42e44106cd003bc59ed))

## [1.1.0](https://github.com/jorgenkg/nodejs-yale-doorman/compare/v1.0.2...v1.1.0) (2021-12-25)


### Features

* add support for refresh token authentication ([b1ac159](https://github.com/jorgenkg/nodejs-yale-doorman/commit/b1ac159964112a7c7c4d973bbd895f785afdc7b2))

### [1.0.2](https://github.com/jorgenkg/nodejs-yale-doorman/compare/v1.0.1...v1.0.2) (2021-12-25)

### 1.0.1 (2021-12-25)

## 1.0.0 (2021-12-25)

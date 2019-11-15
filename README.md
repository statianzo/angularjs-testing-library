# AngularJS Testing Library

Simple and complete AngularJS testing utilities that encourage good testing
practices.

AngularJS Testing Library is a lightweight adapter built on top of
[DOM Testing Library](https://github.com/testing-library/dom-testing-library).

<!-- prettier-ignore-start -->
[![version][version-badge]][package] [![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
<!-- prettier-ignore-end -->

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [The problem](#the-problem)
- [This solution](#this-solution)
- [Installation](#installation)
- [Examples](#examples)
  - [Basic Example](#basic-example)
- [Guiding Principles](#guiding-principles)
- [LICENSE](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## The problem

You want to write maintainable tests for your AngularJS components. As a part of
this goal, you want your tests to avoid including implementation details of your
components and rather focus on making your tests give you the confidence for
which they are intended. As part of this, you want your testbase to be
maintainable in the long run so refactors of your components (changes to
implementation but not functionality) don't break your tests and slow you and
your team down.

## This solution

The `AngularJS Testing Library` is a very lightweight solution for testing
components. It provides light utility functions on top of `angular-mocks` and
`@testing-library/dom-testing-library`, in a way that encourages better testing
practices. Its primary guiding principle is:

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev angularjs-testing-library
```

This library has `peerDependencies` listings for `angular` and `angular-mocks`.

You may also be interested in installing `@testing-library/jest-dom` so you can
use [the custom jest matchers](https://github.com/testing-library/jest-dom).

## Examples

### Basic Example

```js
// hidden-message.js
import angular from 'angular'

class HiddenMessage {
  showMessage = false
}
const template = `
  <div>
    <label for="toggle">Show Message</label>
    <input
      id="toggle"
      type="checkbox"
      ng-model="$ctrl.showMessage"
    />
    <div ng-if="$ctrl.showMessage">
      {{$ctrl.message}}
    </div>
  </div>
`

angular.module('atl', []).component('atlHiddenMessage', {
  template,
  controller: HiddenMessage,
  bindings: {
    message: '<',
  },
})

// __tests__/hidden-message.js
// these imports are something you'd normally configure Jest to import for you
// automatically.
import '@testing-library/jest-dom/extend-expect'
// NOTE: jest-dom adds handy assertions to Jest and is recommended, but not required

import angular from 'angular'
import 'angular-mocks'
import {render, fireEvent} from 'angularjs-testing-library'
import '../hidden-message'

beforeEach(() => angular.mock.module('atl'))

test('shows the children when the checkbox is checked', () => {
  const testMessage = 'Test Message'
  const {queryByText, getByLabelText, getByText} = render(
    `
    <atl-hidden-message message="testMessage"></atl-hidden-message>
  `,
    {
      scope: {
        testMessage,
      },
    },
  )

  // query* functions will return the element or null if it cannot be found
  // get* functions will return the element or throw an error if it cannot be found
  expect(queryByText(testMessage)).toBeNull()

  // the queries can accept a regex to make your selectors more resilient to content tweaks and changes.
  fireEvent.click(getByLabelText(/show/i))

  // .toBeInTheDocument() is an assertion that comes from jest-dom
  // otherwise you could use .toBeDefined()
  expect(getByText(testMessage)).toBeInTheDocument()
})
```

## Guiding Principles

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

We try to only expose methods and utilities that encourage you to write tests
that closely resemble how your components are used.

Utilities are included in this project based on the following guiding
principles:

1.  If it relates to rendering components, it deals with DOM nodes rather than
    component instances, nor should it encourage dealing with component
    instances.
2.  It should be generally useful for testing individual AngularJS components or
    full AngularJS applications.
3.  Utility implementations and APIs should be simple and flexible.

At the end of the day, what we want is for this library to be pretty
light-weight, simple, and understandable.

## LICENSE

[MIT](LICENSE)

<!-- prettier-ignore-start -->

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[version-badge]: https://img.shields.io/npm/v/angularjs-testing-library.svg?style=flat-square
[package]: https://www.npmjs.com/package/angularjs-testing-library
[downloads-badge]: https://img.shields.io/npm/dm/angularjs-testing-library.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/angularjs-testing-library
[license-badge]: https://img.shields.io/npm/l/angular-testing-library.svg?style=flat-square
[license]: https://example.com
[guiding-principle]: https://twitter.com/kentcdodds/status/977018512689455106

<!-- prettier-ignore-end -->

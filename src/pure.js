import angular from 'angular'
import 'angular-mocks'
import {
  getQueriesForElement,
  prettyDOM,
  fireEvent as dtlFireEvent,
} from '@testing-library/dom'

const mountedContainers = new Set()
const mountedScopes = new Set()

function render(ui, {container, baseElement = container, queries, scope} = {}) {
  if (!baseElement) {
    // default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output
    baseElement = document.body
  }
  if (!container) {
    container = baseElement.appendChild(document.createElement('div'))
  }

  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container)

  let $scope
  angular.mock.inject([
    '$compile',
    '$rootScope',
    ($compile, $rootScope) => {
      $scope = $rootScope.$new()
      mountedScopes.add($scope)
      Object.assign($scope, scope)

      const element = $compile(ui)($scope)[0]
      container.appendChild(element)

      $scope.$digest()
    },
  ])

  return {
    container,
    baseElement,
    debug: (el = baseElement) =>
      Array.isArray(el)
        ? // eslint-disable-next-line no-console
          el.forEach(e => console.log(prettyDOM(e)))
        : // eslint-disable-next-line no-console,
          console.log(prettyDOM(el)),
    asFragment: () => {
      /* istanbul ignore if (jsdom limitation) */
      if (typeof document.createRange === 'function') {
        return document
          .createRange()
          .createContextualFragment(container.innerHTML)
      }

      const template = document.createElement('template')
      template.innerHTML = container.innerHTML
      return template.content
    },
    $scope,
    ...getQueriesForElement(baseElement, queries),
  }
}

function cleanup() {
  mountedScopes.forEach(cleanupScope)
  mountedContainers.forEach(cleanupAtContainer)
}

// maybe one day we'll expose this (perhaps even as a utility returned by render).
// but let's wait until someone asks for it.
function cleanupAtContainer(container) {
  if (container.parentNode === document.body) {
    document.body.removeChild(container)
  }
  mountedContainers.delete(container)
}

function cleanupScope(scope) {
  scope.$destroy()
}

function getRootScope() {
  let $rootScope
  angular.mock.inject([
    '$rootScope',
    rootScope => {
      $rootScope = rootScope
    },
  ])
  return $rootScope
}

function fireEvent(...args) {
  const $rootScope = getRootScope()
  const result = dtlFireEvent(...args)
  $rootScope.$digest()
  return result
}

Object.keys(dtlFireEvent).forEach(key => {
  fireEvent[key] = (...args) => {
    const $rootScope = getRootScope()
    const result = dtlFireEvent[key](...args)
    $rootScope.$digest()
    return result
  }
})

// AngularJS maps `mouseEnter` to `mouseOver` and `mouseLeave` to `mouseOut`
fireEvent.mouseEnter = fireEvent.mouseOver
fireEvent.mouseLeave = fireEvent.mouseOut

export * from '@testing-library/dom'
export {render, cleanup, fireEvent}

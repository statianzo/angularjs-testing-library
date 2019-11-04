import angular from 'angular'
import 'angular-mocks'
import {
  getQueriesForElement,
  prettyDOM,
  fireEvent as dtlFireEvent,
  wait as dtlWait,
} from '@testing-library/dom'

const mountedContainers = new Set()
const mountedScopes = new Set()

function render(
  ui,
  {
    container,
    baseElement = container,
    queries,
    scope,
    ignoreUnknownElements,
  } = {},
) {
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

  const $rootScope = getAngularService('$rootScope')
  const $compile = getAngularService('$compile')
  const $scope = $rootScope.$new()
  Object.assign($scope, scope)

  mountedScopes.add($scope)

  const element = $compile(ui)($scope)[0]
  container.appendChild(element)

  $scope.$digest()

  if (!ignoreUnknownElements) {
    assertNoUnknownElements(container)
  }

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
    unmount: () => {
      $scope.$destroy()
    },
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
  mountedScopes.delete(scope)
}

function toCamel(s) {
  return s
    .toLowerCase()
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function assertNoUnknownElements(element) {
  const {tagName} = element
  if (tagName.includes('-')) {
    const $injector = getAngularService('$injector')
    const directiveName = `${toCamel(tagName)}Directive`
    if (!$injector.has(directiveName)) {
      throw Error(
        `Unknown component/directive "${tagName}". Are you missing an import?`,
      )
    }
  }
  Array.from(element.children).forEach(assertNoUnknownElements)
}

function getAngularService(name) {
  let service
  angular.mock.inject([
    name,
    injected => {
      service = injected
    },
  ])
  return service
}

function fireEvent(...args) {
  const $rootScope = getAngularService('$rootScope')
  const result = dtlFireEvent(...args)
  $rootScope.$digest()
  return result
}

Object.keys(dtlFireEvent).forEach(key => {
  fireEvent[key] = (...args) => {
    const $rootScope = getAngularService('$rootScope')
    const result = dtlFireEvent[key](...args)
    $rootScope.$digest()
    return result
  }
})

// AngularJS maps `mouseEnter` to `mouseOver` and `mouseLeave` to `mouseOut`
fireEvent.mouseEnter = fireEvent.mouseOver
fireEvent.mouseLeave = fireEvent.mouseOut

function flush(millis = 50) {
  const $browser = getAngularService('$browser')
  const $rootScope = getAngularService('$rootScope')
  const $interval = getAngularService('$interval')
  $interval.flush(millis)
  $browser.defer.flush(millis)
  $rootScope.$digest()
}

function wait(callback, options = {}) {
  return dtlWait(() => {
    flush(options.interval)
    if (callback) {
      callback()
    }
  }, options)
}

export * from '@testing-library/dom'
export {render, cleanup, fireEvent, wait, flush}

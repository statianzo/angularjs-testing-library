import * as angular from 'angular'
import {
  ICompileService,
  IScope,
  IRootScopeService,
  IIntervalService,
  IFlushPendingTasksService,
} from 'angular'
import 'angular-mocks'
import {
  getQueriesForElement,
  prettyDOM,
  fireEvent as dtlFireEvent,
  wait as dtlWait,
  queries as dtlQueries,
  Queries,
  BoundFunction,
} from '@testing-library/dom'

const mountedContainers = new Set<HTMLElement>()
const mountedScopes = new Set<IScope>()

type RenderOptions<Q extends Queries = typeof dtlQueries> = {
  container?: HTMLElement
  baseElement?: HTMLElement
  queries?: Q
  scope?: object
  ignoreUnknownElements?: boolean
}

type RenderResult<Q extends Queries = typeof dtlQueries> = {
  container: HTMLElement
  baseElement: HTMLElement
  debug: (
    baseElement?:
      | HTMLElement
      | DocumentFragment
      | Array<HTMLElement | DocumentFragment>,
  ) => void
  unmount: () => void
  asFragment: () => DocumentFragment
  $scope: IScope
} & {[P in keyof Q]: BoundFunction<Q[P]>}

function render(
  ui: string,
  {
    container,
    baseElement = container,
    queries,
    scope,
    ignoreUnknownElements = false,
  }: RenderOptions = {},
): RenderResult {
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

  const $rootScope = inject<IRootScopeService>('$rootScope')
  const $compile = inject<ICompileService>('$compile')
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
          el.forEach(e => console.log(prettyDOM(e as HTMLElement)))
        : // eslint-disable-next-line no-console,
          console.log(prettyDOM(el as HTMLElement)),
    asFragment: () => {
      const source = container as HTMLElement
      /* istanbul ignore if (jsdom limitation) */
      if (typeof document.createRange === 'function') {
        return document.createRange().createContextualFragment(source.innerHTML)
      }

      const template = document.createElement('template')
      template.innerHTML = source.innerHTML
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
function cleanupAtContainer(container: HTMLElement) {
  if (container.parentNode === document.body) {
    document.body.removeChild(container)
  }
  mountedContainers.delete(container)
}

function cleanupScope(scope: IScope) {
  scope.$destroy()
  mountedScopes.delete(scope)
}

function toCamel(s: string) {
  return s
    .toLowerCase()
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

function assertNoUnknownElements(element: Element) {
  const {tagName} = element
  if (tagName.includes('-')) {
    const $injector = inject<angular.auto.IInjectorService>('$injector')
    const directiveName = `${toCamel(tagName)}Directive`
    if (!$injector.has(directiveName)) {
      throw Error(
        `Unknown component/directive "${tagName}". Are you missing an import?`,
      )
    }
  }
  Array.from(element.children).forEach(assertNoUnknownElements)
}

function inject<T = unknown>(name: string): T {
  let service
  angular.mock.inject([
    name,
    injected => {
      service = injected
    },
  ])
  return (service as unknown) as T
}

// AngularJS maps `mouseEnter` to `mouseOver` and `mouseLeave` to `mouseOut`
// Create a copy so we can alter it
const fireEvent = dtlFireEvent.bind(null)
Object.assign(fireEvent, dtlFireEvent)

fireEvent.mouseEnter = dtlFireEvent.mouseOver
fireEvent.mouseLeave = dtlFireEvent.mouseOut

function flush(millis = 50) {
  const $flushPendingTasks = inject<IFlushPendingTasksService>(
    '$flushPendingTasks',
  )
  const $rootScope = inject<IRootScopeService>('$rootScope')
  const $interval = inject<IIntervalService>('$interval')
  $interval.flush(millis)
  $flushPendingTasks(millis)
  $rootScope.$digest()
}

type WaitOptions = Parameters<typeof dtlWait>[1]
function wait(callback?: () => void, options: WaitOptions = {}) {
  return dtlWait(() => {
    flush(options.interval)
    if (callback) {
      callback()
    }
  }, options)
}

export * from '@testing-library/dom'
export {render, cleanup, fireEvent, wait, flush, inject}

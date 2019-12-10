import * as angular from 'angular'
import 'angular-mocks'
import {render} from '../'

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
})

test('renders div into document', () => {
  const {container} = render(`<div id="child"></div>`)
  expect((container.firstElementChild as Element).id).toBe('child')
})

test('returns baseElement which defaults to document.body', () => {
  const {baseElement} = render(`<div></div>`)
  expect(baseElement).toBe(document.body)
})

test('supports fragments', () => {
  angular.module('atl').component('atlFragment', {
    template: `
      <div>
        <code>DocumentFragment</code> is pretty cool!
      </div>
    `,
  })

  const {asFragment} = render(`<atl-fragment></atl-fragment>`)
  expect(asFragment()).toMatchSnapshot()
})

test('assigns to scope', () => {
  const {getByText} = render(`<div>Hello {{name}}</div>`, {
    scope: {
      name: 'World',
    },
  })

  expect(() => getByText('Hello World')).not.toThrow(
    'Unable to find an element with the text: Hello World.',
  )
})

test('throws on unknown custom elements', () => {
  angular.module('atl').component('atlParent', {
    template: `
      <h1>Hi</hz>
      <atl-child></atl-child>
    `,
  })

  expect(() => render(`<atl-parent></atl-parent>`)).toThrow(
    'Unknown component/directive "ATL-CHILD"',
  )
})

test('suppresses unknown custom elements error', () => {
  angular.module('atl').component('atlParent', {
    template: `
      <h1>Hi</hz>
      <atl-child></atl-child>
    `,
  })

  const {container} = render(`<atl-parent></atl-parent>`, {
    ignoreUnknownElements: true,
  })
  expect(container.querySelector('atl-child')).toBeDefined()
})

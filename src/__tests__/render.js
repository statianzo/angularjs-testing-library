import angular from 'angular'
import 'angular-mocks'
import {render} from '../'

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
})

test('renders div into document', () => {
  const {container} = render(`<div id="child"></div>`)
  expect(container.firstChild.id).toBe('child')
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

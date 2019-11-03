import angular from 'angular'
import 'angular-mocks'
import {render, wait} from '../'

class controller {
  loading = true
  data = null

  constructor($q, $timeout) {
    this.$q = $q
    this.$timeout = $timeout
  }

  load() {
    return this.$q(resolve => {
      // we are using random timeout here to simulate a real-time example
      // of an async operation calling a callback at a non-deterministic time
      const randomTimeout = Math.floor(Math.random() * 100)
      this.$timeout(() => {
        resolve({returnedMessage: 'Hello World'})
      }, randomTimeout)
    })
  }

  $onInit() {
    this.load().then(response => {
      this.loading = false
      this.data = response
    })
  }
}

const template = `
  <div ng-if="$ctrl.loading">Loading...</div>
  <div
    ng-if="!$ctrl.loading"
    data-testid="message"
  >
    Loaded this message: {{$ctrl.data.returnedMessage}}!
  </div>
`

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
  angular.module('atl').component('atlEnd', {
    template,
    controller,
  })
})

test('it waits for the data to be loaded', async () => {
  const {queryByText, findByTestId} = render(`<atl-end></atl-end>`)

  expect(queryByText('Loading...')).toBeTruthy()

  await wait(() => expect(queryByText('Loading...')).toBeNull())
  const message = await findByTestId('message')
  expect(message.textContent).toMatch(/Hello World/)
})

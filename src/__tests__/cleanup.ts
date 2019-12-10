import * as angular from 'angular'
import 'angular-mocks'
import {render, cleanup} from '../'

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
})

test('cleans up the document', () => {
  const spy = jest.fn()
  angular.module('atl').component('atlCleanup', {
    template: `<div id="{{$ctrl.divId}}"></div>`,
    controller: class {
      divId = 'my-div'

      $onDestroy() {
        expect(document.getElementById(this.divId)).toBeInTheDocument()
        spy()
      }
    },
  })

  render(`<atl-cleanup></atl-cleanup>`)
  cleanup()
  expect(document.body.innerHTML).toBe('')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('cleanup does not error when an element is not a child', () => {
  render(`<div></div>`, {container: document.createElement('div')})
  cleanup()
})

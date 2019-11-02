import angular from 'angular'
import 'angular-mocks'
import {render, fireEvent} from '../'

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
})

test('`fireEvent` triggers a digest', () => {
  angular.module('atl').component('atlDigest', {
    template: `
      <button ng-ref="$ctrl.btn">
        Click Me
      </button>
      <div ng-if="$ctrl.wasClicked">
        Clicked!
      </div>
    `,
    controller: class {
      wasClicked = false
      btn = null
      $postLink() {
        this.btn.on('click', this.handleClick)
      }

      handleClick = () => {
        this.wasClicked = true
      }
    },
  })

  const {getByRole, queryByText} = render(`<atl-digest></atl-digest>`)

  const button = getByRole('button')
  expect(queryByText('Clicked!')).toBeNull()
  fireEvent.click(button)
  expect(queryByText('Clicked!')).not.toBeNull()
})

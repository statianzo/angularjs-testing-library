import angular from 'angular'
import 'angular-mocks'
import {render, fireEvent, wait} from '../'

class StopWatch {
  lapse = 0
  running = false

  constructor($interval) {
    this.$interval = $interval
  }

  handleRunClick = () => {
    if (this.running) {
      clearInterval(this.timer)
    } else {
      const startTime = Date.now() - this.lapse
      this.timer = this.$interval(() => {
        this.lapse = Date.now() - startTime
      })
    }
    this.running = !this.running
  }

  handleClearClick = () => {
    this.$interval.cancel(this.timer)
    this.lapse = 0
    this.running = false
  }

  $onDestroy() {
    this.$interval.cancel(this.timer)
  }
}

const template = `
  <div>
    <span data-testid="elapsed">{{$ctrl.lapse}}ms</span>
    <button ng-click="$ctrl.handleRunClick()">
      {{$ctrl.running ? 'Stop' : 'Start'}}
    </button>
    <button ng-click="$ctrl.handleClearClick()">Clear</button>
  </div>
`

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
  angular.module('atl').component('atlStopwatch', {
    template,
    controller: StopWatch,
  })
})

test('unmounts a component', async () => {
  const {$scope, unmount, getByText, getByTestId} = render(
    `<atl-stopwatch></atl-stopwatch>`,
  )
  const elapsedTime = getByTestId('elapsed')

  expect(elapsedTime).toHaveTextContent('0ms')

  fireEvent.click(getByText('Start'))
  // Ensure it starts
  getByText('Stop')

  await wait()

  expect(elapsedTime.textContent).not.toEqual('0ms')

  unmount()

  expect($scope.$$destroyed).toBe(true)
})

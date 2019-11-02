import angular from 'angular'
import 'angular-mocks'
import {render} from '../'

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  console.log.mockRestore()
})

beforeEach(() => {
  angular.module('atl', [])
  angular.mock.module('atl')
})

test('debug pretty prints the container', () => {
  angular.module('atl').component('atlHelloWorld', {
    template: `<h1>Hello World</h1>`,
  })
  const {debug} = render(`<atl-hello-world></atl-hello-world>`)
  debug()
  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Hello World'),
  )
})

test('debug pretty prints multiple containers', () => {
  angular.module('atl').component('atlHelloWorld', {
    template: `
      <h1 data-testid="testId">Hello World</h1>
      <h1 data-testid="testId">Hello World</h1>
    `,
  })
  const {getAllByTestId, debug} = render(`<atl-hello-world></atl-hello-world>`)
  const multipleElements = getAllByTestId('testId')
  debug(multipleElements)

  expect(console.log).toHaveBeenCalledTimes(2)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Hello World'),
  )
})

/* eslint no-console:0 */

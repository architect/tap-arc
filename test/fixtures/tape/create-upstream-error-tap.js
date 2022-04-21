const test = require('tape')

// eslint-disable-next-line import/no-unresolved, no-unused-vars
const { hello } = require('./this-is-a-fake-path')

test('tests pass, but this should exit code 0', function (t) {
  t.ok('OKAY')
  t.end()
})

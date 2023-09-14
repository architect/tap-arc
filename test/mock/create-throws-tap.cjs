const test = require('tape')

// issue #29 related test case
test('create various throws TAP output', (t) => {
  // throws without assertion
  t.throws(() => {
    throw new Error('my error')
  }, 'pass because throw')
  t.throws(() => {
    'no throw'
  }, 'fails because no throw')
  // throws with assertion
  t.throws(() => {
    throw new Error('no good error')
  }, /good error/, 'passing match case')
  t.throws(() => {
    throw new Error('no good error')
  }, /bad error/, 'failing no match case')

  // doesNotThrow with message
  t.doesNotThrow(() => {
    'pass'
  }, 'pass because no throw')
  t.doesNotThrow(() => {
    throw new Error('my error')
  }, 'fail because throw')

  t.end()
})

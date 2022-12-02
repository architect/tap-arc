// Adapted from testling's tape guide
// https://ci.testling.com/guide/tape

const test = require('tape')

test('basic arithmetic', (t) => {
  t.equal(2 + 3, 5)
  t.equal(7 * 8 + 9, 65)

  t.end()
})

test('deep equality', (t) => {
  t.plan(2)

  t.deepEqual([ 3, 4, 5 ], [ 3, 4, 2 + 3 ])
  t.deepEqual({ a: 7, b: [ 8, 9 ] }, { a: 3 + 4, b: [ 4 * 2 ].concat(3 * 3) })
})

test('comparing booleans', (t) => {
  t.plan(1)

  t.ok(3 > 4 || 5 > 2)
})

test('negatives', (t) => {
  t.plan(3)
  t.notEqual(1 + 2, 5)
  t.notDeepEqual([ 1, 2 ], [ 12 ])
  t.notOk(false)
})

test('empty map', (t) => {
  [].map(() => {
    t.fail('this callback should never fire')
  })

  t.end()
})

test('map with elements', (t) => {
  t.plan(2);

  [ 2, 3 ].map(() => {
    t.pass()
  })
})

test('more info', (t) => {
  t.plan(2)

  t.equal(1 + 2, 3, 'basic arithmetic still works')
  t.ok(3 + 4 > 5, 'inequalities are as we might expect')
})

test('asynchronous results', (t) => {
  t.plan(2)

  t.equal(2 + 3, 5)

  setTimeout(function () {
    t.equal(5 + 5, 10)
  }, 500)
})

test('nested', (t) => {
  t.test((st) => {
    st.plan(1)
    st.equal(1 + 2, 3)
  })

  t.test((st) => {
    st.plan(1)
    setTimeout(function () {
      st.pass()
    }, 100)
  })
})

// Adapted from testling's tape guide
// https://ci.testling.com/guide/tape

const test = require('tape')

test('basic arithmetic', (t) => {
  t.equal(5, 5)
  t.equal(65, 65)

  t.end()
})

test('deep equality', (t) => {
  t.plan(2)

  t.deepEqual([ 3, 4, 5 ], [ 3, 4, 5 ])
  t.deepEqual({ a: 7, b: [ 8, 9 ] }, { a: 7, b: [ 8 ].concat(9) })
})

test('comparing booleans', (t) => {
  t.plan(1)

  t.ok(3 > 4 || 5 > 2)
})

test('negatives', (t) => {
  t.plan(3)
  t.notEqual(3, 5)
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

  t.equal(3, 3, 'basic arithmetic still works')
  t.ok(7 > 5, 'inequalities are as we might expect')
})

test('asynchronous results', (t) => {
  t.plan(2)

  t.equal(5, 5)

  setTimeout(function () {
    t.equal(10, 10)
  }, 500)
})

test('nested', (t) => {
  t.test('a nested test 1', (st) => {
    st.plan(1)
    st.equal(3, 3)
  })

  t.test('a nested test 2', (st) => {
    st.plan(1)
    setTimeout(function () {
      st.pass()
    }, 100)
  })
})

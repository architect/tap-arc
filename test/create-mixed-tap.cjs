const test = require('tape')

test('basic arithmetic without messages', (t) => {
  t.equal(2 + 3, 5)
  t.equal(7 * 8 + 10, 666)

  t.end()
})

test('logging inside a test', (t) => {
  console.log('Logging from a test can be helpful')
  console.log('\u001B[?25l') // should not print
  console.log('This one is multiline')
  console.log('there should be no empty lines.')

  t.end()
})

test('deep equality', (t) => {
  t.plan(5)

  t.deepEqual([ 3, 4, 5 ], [ 3, 4, 2 + 3 ], 'An Array pass')
  t.deepEqual({ a: 7, b: [ 8, 9 ] }, { a: 3 + 4, b: [ 4 * 2 ].concat(3 * 3) }, 'And Object pass')
  t.skip('Skipping an arbitrary test')
  t.deepEqual([ 3, 4, 6 ], [ 3, 4, 2 + 3 ], 'An Array failure')
  t.deepEqual({ a: 7, b: [ 8, 9 ] }, { a: 3 + 4, b: [ 4 * 3 ].concat(3 * 3) }, 'An Object failure')
})

test('comparing booleans', (t) => {
  t.plan(4)

  t.ok(3 > 4 || 5 > 2, 'A passing Boolean')
  t.ok(3 > 4 || 2 > 5, 'A failing Boolean')
  t.notOk(false, 'A passing !Boolean')
  t.notOk(true, 'A failing !Boolean')
})

test('iterators', (t) => {
  t.plan(3);

  [ 1, 2 ].map((x) => {
    t.ifError(x < 2, `Simple ifError ${x}`)
  });

  [ 3 ].map((x) => {
    t.error(new Error(`"x" is ${x}. Halt and catch fire!`))
  })

  t.end()
})

test('nested', (t) => {
  t.test((st) => {
    st.plan(4)
    st.match('atreides', /^A/, 'Sub-test match fail')
    st.doesNotMatch('Hark0nnen', /[0-9]/, 'Sub-test doesNotMatch fail')
    st.match('Idaho', /^[a-zA-z]{5}$/, 'Sub-test match pass')
    st.doesNotMatch('Gurney', /^G[a-zA-Z]y$/, 'Sub-test doesNotMatch pass')
  })

  t.test((st) => {
    st.plan(2)
    setTimeout(function () {
      st.pass('Delayed sub-test pass')
      st.fail('Delayed sub-test fail')
    }, 1100)
  }, 'Delayed sub-test')
})

test('throws', (t) => {
  t.plan(2)

  t.throws(() => {
    return 'sand power'
  }, 'A failing throws')

  t.doesNotThrow(() => {
    throw 'Spice'
  }, 'A failing doesNotThrow')

  t.end()
})

test('some TODO tests', { todo: true }, (t) => {
  t.ok(true, "Tests todo aren't really tests")
  t.fail('Test the actual library')
  t.end()
})

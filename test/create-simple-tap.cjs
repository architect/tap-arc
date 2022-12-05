const test = require('tape')

test('Sample passing tests', (t) => {
  t.plan(5)

  t.match('Idaho', /^[a-zA-z]{5}$/, 'Sub-test match pass')
  console.log('Arbitrary logs supported')
  t.doesNotMatch('Gurney', /^G[a-zA-Z]y$/, 'Sub-test doesNotMatch pass')
  t.deepEqual([ 3, 4, 5 ], [ 3, 4, 2 + 3 ], 'A deeply equal array')
  t.skip('A skipped test')
  t.deepEqual({ a: 7, b: [ 8, 9 ] }, { a: 3 + 4, b: [ 8, 9 ] }, 'A deeply equal object')
})

test('Some failing tests', (t) => {
  t.plan(4)

  t.equal(7 * 8 + 10, 666)
  t.equal('Bad dog', 'Good dog')
  t.match('atreides', /^A/, 'Sub-test match fail')

  t.test((st) => {
    st.deepEqual(
      [ 'foo', 'bar', 'baz' ],
      [ 'foo', 'bar', 'foobar baz' ],
      'Sub-test partial array failure'
    )
    st.deepEqual(
      { a: 'foo', b: [ 42 ], c: 'baz' },
      { a: 'bar', b: [ 42 ] },
      'A small object deepEqual failure'
    )
    st.end()
  }, 'Nested tests')
})

test(
  (t) => {
    t.pass('Passing TODOs are yellow')
    t.fail('Failing TODOs are red')
    t.end()
  },
  { todo: true },
  'Some tests marked as "todo"'
)
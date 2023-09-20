import test from 'tape'

test('runtime error test', (t) => {
  t.plan(4)
  const foo = {}

  t.error(foo.bar, 'foo.bar should be error-ish') // pass
  t.notok(foo, 'foo should be falsy') // fail
  t.ok(foo.bar.baz, 'foo.bar.baz should be truthy') // runtime error
  t.error(foo.bar.baz.quux, 'foo.bar.baz.quux should be error-ish') // doesn't run
})

const test = require('tape')

test('Numbers', (t) => {
  t.equal(42, 43, 'Numbers: not equal')

  t.end()
})

test('Array deepEqual failures', (t) => {
  t.deepEqual( // reported as arrays; diffed as arrays with diffArray
    [ 42, 'foo', 'bar', 'baz', true, 'qux', undefined ], // actual
    [ 'foo', 'bar', 'qux', null, NaN, Infinity ], // expected
    'Array: mixed',
  )

  t.deepEqual( // reported as arrays; diffed as arrays with diffArray
    [ 'foo', 'bar', ],     // actual
    [ 'foo', 'bar', 666 ], // expected
    'Array: actual missing item',
  )

  t.deepEqual( // reported as arrays; diffed as arrays with diffArray
    [ 'foo', 'bar', 666 ], // actual
    [ 'foo', 'bar' ],      // expected
    'Array: actual has extra item',
  )

  t.deepEqual( // reported as strings; parsed as JSON; diffed as JSON
    [ [ 'foo', 'bar', 'baz' ], [ 'foo', 'bar', 'qux' ], [ 'foo', 'bar', 'qux' ] ],
    [ [ 'foo', 'bar', 'qux' ], [ 'foo', 'bar', 'baz' ], [ 'foo', 'bar', [ 'foo', 'bar', 'baz' ] ] ],
    'Array: multi-dimensional',
  )

  t.end()
})

test('Object deepEqual failures', (t) => {
  t.deepEqual( // reported as strings; parsed as JSON; diffed as JSON
    { a: 'foo', b: [ 11, 9 ], c: { foo: 'bar' } }, // actual
    { b: [ 12, 9 ], a: 'bar', c: 'foobar' },       // expected
    'JSON: A small object deepEqual failure',
  )

  t.deepEqual(
    {
      id: 'Grandad',
      children: [
        {
          id: 'Dad',
          children: [
            {
              id: 'Me',
              children: [ 'Daughter' ],
            },
          ],
        },
        {
          id: 'Aunt',
          children: [],
        },
      ],
    },
    {
      id: 'Grandad',
      children: [
        {
          id: 'Dad',
          children: [
            {
              id: 'Me',
              children: [],
            },
          ],
        },
        {
          id: 'Aunt',
          children: [],
        },
      ],
    },
    'JSON: Shallow TAP output cannot be diffed, still fails',
  )

  t.deepEqual( // reported as strings; can't be parsed; diffed as line
    {
      name: 'Gurney',
      house: 'Atreides',
      play: () => '🎸',
    },
    {
      name: 'Duncan',
      house: 'Atreides',
      fight: () => '⚔️',
    },
    'Object: with function will be diffed as a string',
  )

  t.deepEqual( // reported as strings; expected parsed as JSON; !sameType; not diffed
    {
      name: 'Gurney',
      house: 'Atreides',
      play: () => '🎸',
    },
    {
      name: 'Duncan',
      house: 'Atreides',
      fight: '⚔️',
    },
    'Object vs JSON: reported as different types; not diffed',
  )

  t.end()
})

test('Multi-line string failures', (t) => {
  t.equal(/* html*/
    `
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <web-counter count="42"></web-counter>
  </body>
</html>
    `.trim(),
    /* html*/`
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <page-title>HTML First!</page-title>
  </body>
</html>
    `.trim(),
    'Multi-line string failures are diffed as strings'
  )

  t.end()
})

test('Deeply nested object failures', { objectPrintDepth: 100 }, (t) => {
  t.deepEqual(
    {
      id: 'Grandad',
      children: [
        {
          id: 'Dad',
          children: [
            {
              id: 'Me',
              children: [ 'Daughter' ],
            },
          ],
        },
        {
          id: 'Aunt',
          children: [],
        },
      ],
    },
    {
      id: 'Grandad',
      children: [
        {
          id: 'Dad',
          children: [
            {
              id: 'Me',
              children: [],
            },
          ],
        },
        {
          id: 'Aunt',
          children: [ 'Son' ],
        },
      ],
    },
    'Nested JSON diffs',
  )

  t.end()
})

test('Mixed type failures', (t) => {
  t.deepEqual(
    { a: 'foo', b: [ 11, 9 ], c: { foo: 'bar' } },
    'foobar baz',
    'JSON vs string failure',
  )

  t.equal(666, 'foobar baz', 'Number vs string failure')

  t.end()
})

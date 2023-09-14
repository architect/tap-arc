const test = require('tape')

test('Object deepEqual fail', (t) => {
  t.deepEqual(
    [ 'foo', 'bar', 'baz', 'thing' ],
    [ 'foo', 'bar', 'foobar baz' ],
    'Single dimension array failure',
  )
  t.deepEqual(
    { a: 'foo', b: [ 11, 9 ], c: { foo: 'bar' } },
    { b: [ 12, 9 ], a: 'bar', c: 'foobar' },
    'A small object deepEqual failure',
  )
  t.deepEqual(
    {
      name: 'Gurney',
      house: 'Atreides',
      play: () => {
        '🎸'
      },
    },
    {
      name: 'Duncan',
      house: 'Atreides',
      fight: () => {
        '⚔️'
      },
    },
    'Object with fn deepEqual failure will be diffed as a string',
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
    'Shallow TAP output cannot be diffed, but it is a failure',
  )

  t.end()
})

test('Multi-line string failures', (t) => {
  t.equal(/* html*/`
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <web-counter count="42"></web-counter>
  </body>
</html>`.trim(),
  /* html*/`
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <page-title>HTML First!</page-title>
  </body>
</html>`.trim(),
  )
})

test('Deeply nested object failures', { objectPrintDepth: 10 }, (t) => {
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
    'Nested JSON diffs are expressed as (c)hunks',
  )

  t.end()
})

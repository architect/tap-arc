import { Readable } from 'stream'
import test from 'tape'
import tapArc from '../src/tap-arc.js'

const TAP = {
  IN: {
    comment:   '# Comment',
    ok:        'ok 1 should be truthy',
    notOk:     'not ok 2 should be falsy',
    plan:      '1..2',
    planTests: '# tests 2',
    planPass:  '# pass 1',
    planFail:  '# fail 1',
  },
  OUT: [
    '\x1B[1m\x1B[4mComment\x1B[24m\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mshould be truthy\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [2] \x1B[31mshould be falsy\x1B[39m',
    '\x1B[31mFailed tests:\x1B[39m There was \x1B[31m1\x1B[39m failure',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [2] \x1B[31mshould be falsy\x1B[39m',
    'total:     2',
    '\x1B[32mpassing:   1\x1B[39m',
    '\x1B[31mfailing:   1\x1B[39m'
  ],
}

test('basic output formatting', (t) => {
  const readable = new Readable({ read () { } })
  const parser = tapArc({
    color: true,
    help: false,
    pessimistic: false,
    failBadCount: false,
    verbose: false,
    debug: false,
  })

  let chunks = ``
  parser.on('data', (chunk) => {
    chunks += chunk.toString()
  })

  parser.on('end', () => {
    const actual = chunks.trim().split('\n').slice(0, -1).filter(l => l.length > 0) // remove timer
    const expected = Object.keys(TAP.OUT).map((key) => TAP.OUT[key])
    t.deepEqual(actual, expected, 'should print expected output')
    t.end()
  })

  readable.pipe(parser)

  const lines = Object.keys(TAP.IN).map((key) => TAP.IN[key])
  for (const line of lines) readable.push(`${line}\n`)

  readable.push(null)
})


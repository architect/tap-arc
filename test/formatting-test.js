import { Readable } from 'stream'
import test from 'tape'
import tapArc from '../src/tap-arc.js'

const TAP = {
  IN: [
    'TAP version 13',
    '# Sample passing tests',
    'ok 1 Regex: match pass',
    'Arbitrary logs supported',
    'ok 2 Regex: doesNotMatch pass',
    'ok 3 A deeply equal array',
    'ok 4 A skipped test # SKIP',
    'ok 5 A deeply equal object',
    '# TODO Some tests marked as "todo"',
    'ok 6 A passing TODO # TODO',
    'not ok 7 A failing TODO # TODO',
    '  ---',
    '    operator: fail',
    '    at: Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:19:7)',
    '  ...',
    '# Some failing tests',
    'not ok 8 should be strictly equal',
    '  ---',
    '    operator: equal',
    '    expected: 666',
    '    actual:   66',
    '    at: Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:27:5)',
    '    stack: |-',
    '      Error: should be strictly equal',
    '          at Test.assert [as _assert] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:479:48)',
    '          at Test.strictEqual (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:643:7)',
    '          at Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:27:5)',
    '          at Test.run (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:113:28)',
    '          at Immediate.next [as _onImmediate] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/results.js:157:7)',
    '          at process.processImmediate (node:internal/timers:476:21)',
    '  ...',
    'not ok 9 should be strictly equal',
    '  ---',
    '    operator: equal',
    '    expected: \'Good dog\'',
    '    actual:   \'Bad dog\'',
    '    at: Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:28:5)',
    '    stack: |-',
    '      Error: should be strictly equal',
    '          at Test.assert [as _assert] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:479:48)',
    '          at Test.strictEqual (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:643:7)',
    '          at Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:28:5)',
    '          at Test.run (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:113:28)',
    '          at Immediate.next [as _onImmediate] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/results.js:157:7)',
    '          at process.processImmediate (node:internal/timers:476:21)',
    '  ...',
    'not ok 10 Regex: match fail',
    '  ---',
    '    operator: match',
    '    expected: /^A/',
    '    actual:   \'atreides\'',
    '    at: Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:29:5)',
    '    stack: |-',
    '      Error: Regex: match fail',
    '          at Test.assert [as _assert] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:479:48)',
    '          at Test.match (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:900:8)',
    '          at Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:29:5)',
    '          at Test.run (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:113:28)',
    '          at Immediate.next [as _onImmediate] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/results.js:157:7)',
    '          at process.processImmediate (node:internal/timers:476:21)',
    '  ...',
    '# Nested tests',
    'not ok 11 Sub-test partial array failure',
    '  ---',
    '    operator: deepEqual',
    '    expected: [ \'foo\', \'bar\', \'foobar baz\' ]',
    '    actual:   [ \'foo\', \'bar\', \'baz\' ]',
    '    at: Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:32:8)',
    '    stack: |-',
    '      Error: Sub-test partial array failure',
    '          at Test.assert [as _assert] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:479:48)',
    '          at Test.tapeDeepEqual (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:720:7)',
    '          at Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:32:8)',
    '          at Test.run (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:113:28)',
    '          at Test._end (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:385:5)',
    '          at Immediate._onImmediate (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:154:9)',
    '          at process.processImmediate (node:internal/timers:476:21)',
    '  ...',
    'not ok 12 A small object deepEqual failure',
    '  ---',
    '    operator: deepEqual',
    '    expected: |-',
    '      { a: \'bar\', b: [ 420 ] }',
    '    actual: |-',
    '      { a: \'foo\', b: [ 42 ], c: \'baz\' }',
    '    at: Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:37:8)',
    '    stack: |-',
    '      Error: A small object deepEqual failure',
    '          at Test.assert [as _assert] (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:479:48)',
    '          at Test.tapeDeepEqual (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:720:7)',
    '          at Test.<anonymous> (/Users/tbeseda/dev/architect/tap-arc/test/mock/create-simple-tap.cjs:37:8)',
    '          at Test.run (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:113:28)',
    '          at Test._end (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:385:5)',
    '          at Immediate._onImmediate (/Users/tbeseda/dev/architect/tap-arc/node_modules/tape/lib/test.js:154:9)',
    '          at process.processImmediate (node:internal/timers:476:21)',
    '  ...',
    '',
    '1..12',
    '# tests 12',
    '# pass  7',
    '# fail  5',
  ],
  OUT: [
    '\x1B[1m\x1B[4mSample passing tests\x1B[24m\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mRegex: match pass\x1B[22m',
    '\x1B[3mArbitrary logs supported\x1B[23m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mRegex: doesNotMatch pass\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mA deeply equal array\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[36m⇥\x1B[39m\x1B[22m \x1B[2mA skipped test\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mA deeply equal object\x1B[22m',
    '\x1B[1m\x1B[4mSome tests marked as "todo"\x1B[24m\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[36m␣\x1B[39m\x1B[22m \x1B[2mA passing TODO\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[36m␣\x1B[39m\x1B[22m [7] \x1B[31mA failing TODO\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mExplicit fail',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2mAt: Test.<anonymous> (/test/mock/create-simple-tap.cjs:19:7)\x1B[22m',
    '\x1B[1m\x1B[4mSome failing tests\x1B[24m\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [8] \x1B[31mshould be strictly equal\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mExpected \x1B[33m666\x1B[39m but got \x1B[34m66\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2mAt: Test.<anonymous> (/test/mock/create-simple-tap.cjs:27:5)\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [9] \x1B[31mshould be strictly equal\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mActual:   "Bad dog"',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mExpected: "Good dog"',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2mAt: Test.<anonymous> (/test/mock/create-simple-tap.cjs:28:5)\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [10] \x1B[31mRegex: match fail\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mExpected "\x1B[34matreides\x1B[39m" to match \x1B[33m/^A/\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2mAt: Test.<anonymous> (/test/mock/create-simple-tap.cjs:29:5)\x1B[22m',
    '\x1B[1m\x1B[4mNested tests\x1B[24m\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [11] \x1B[31mSub-test partial array failure\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mActual:   ["foo","bar","baz"]',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mExpected: ["foo","bar","foobar baz"]',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2mAt: Test.<anonymous> (/test/mock/create-simple-tap.cjs:32:8)\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [12] \x1B[31mA small object deepEqual failure\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mActual:   {"a":"foo","b":[42],"c":"baz"}',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22mExpected: {"a":"bar","b":[420]}',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[2mAt: Test.<anonymous> (/test/mock/create-simple-tap.cjs:37:8)\x1B[22m',
    '\x1B[31mFailed tests:\x1B[39m There were \x1B[31m5\x1B[39m failures',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [8] \x1B[31mshould be strictly equal\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [9] \x1B[31mshould be strictly equal\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [10] \x1B[31mRegex: match fail\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [11] \x1B[31mSub-test partial array failure\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [12] \x1B[31mA small object deepEqual failure\x1B[39m',
    'total:     12',
    '\x1B[32mpassing:   7\x1B[39m',
    '\x1B[31mfailing:   5\x1B[39m',
    '\x1B[2mskipped:   1\x1B[22m',
    '\x1B[2mtodo:      2\x1B[22m',
  ],
}

test('basic output formatting', (t) => {
  const input = new Readable()

  let chunks = ``
  const output = {
    write (string) { chunks += string }
  }

  const parser = tapArc(
    input,
    output,
    {
      color: true,
      help: false,
      pessimistic: false,
      failBadCount: false,
      verbose: false,
      debug: false,
    }
  )

  for (const line of TAP.IN) input.push(`${line}\n`)
  input.push(null)

  parser.on('end', () => {
    const actual = chunks.trim().split('\n').slice(0, -1).filter(l => l.length > 0) // remove timer

    // console.log({ actual, expected: TAP.OUT })

    t.deepEqual(actual, TAP.OUT, 'should print expected output')
    t.end()
  })
})

import test from 'tape'
import { defaultOptions } from '../index.js'
import tapArc from '../src/tap-arc.js'

test('basic formatting', (t) => {
  t.plan(1)
  const TAP = {
    IN: {
      comment: '# comment',
      ok: 'ok 1 should be truthy',
      notOk: 'not ok 2 should be falsy',
    },
    OUT: {
      comment: '\x1B[2m# comment\x1B[22m',
      ok: '\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mshould be truthy\x1B[22m',
      notOk: '\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [2] \x1B[31mshould be falsy\x1B[39m',
    },
    OOOUT: `\x1B[1m\x1B[4mcomment\x1B[24m\x1B[22m\n\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mshould be truthy\x1B[22m\n\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [2] \x1B[31mshould be falsy\x1B[39m\n\n\x1B[31mFailed tests:\x1B[39m There were \x1B[31m2\x1B[39m failures\n\n\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [2] \x1B[31mshould be falsy\x1B[39m\n\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m [undefined] \x1B[31mundefined\x1B[39m\n\ntotal:     2\n\x1B[32mpassing:   1\x1B[39m\n\x1B[31mfailing:   2\x1B[39m`,
  }
  const parser = tapArc(defaultOptions)

  parser._write(TAP.IN.comment, null, (...args) => { console.log('comment', ...args) })
})

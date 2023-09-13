import { exec } from 'child_process'
import { join } from 'path'
import { Readable } from 'stream'
import test from 'tape'
import tapArc from '../src/tap-arc.js'

test('streams and exit codes', (t) => {
  for (const ft of [ 'diff', 'mixed', 'simple', 'throws' ]) {
    const filename = `create-${ft}-tap.cjs`
    t.test(`exit(1) "${filename}" | tap-arc`, (t) => {
      t.plan(3)
      exec(
        `npx tape ${join('.', 'test', filename)} | node index.js`,
        (error, stdout, stderr) => {
          t.ok(error, `"${filename}" creates an error`)
          t.notOk(stderr, 'stderror should be empty')
          t.ok(stdout.indexOf('Failed tests:') > 0, '"Failed tests:" should occur in output')
        }
      )
    })
  }

  for (const pt of [ 'passing', 'empty' ]) {
    const filename = `create-${pt}-tap.cjs`
    t.test(`exit(0) "${filename}" | tap-arc`, (t) => {
      t.plan(3)
      exec(
        `npx tape ${join('.', 'test', filename)} | node index.js`,
        (error, stdout, stderr) => {
          t.notOk(error, 'error should be undefined')
          t.notOk(stderr, 'stderror should be empty')
          t.ok(stdout.indexOf('Failed tests:') < 0, '"Failed tests:" shouldn\'t occur in output')
        }
      )
    })
  }

  const filename = 'create-upstream-error-tap.cjs'
  t.test(`exit(1) "${filename}" | tap-arc`, { todo: true }, (t) => {
    t.plan(2)
    exec(
      `npx tape ${join('.', 'test', filename)} | node index.js`,
      (error, stdout, stderr) => {
        t.ok(error, `"${filename}" creates an error`)
        t.notOk(stderr, 'stderror should be empty')
        t.end()
      }
    )
  })
})

const TAP = {
  IN: {
    comment: '# comment',
    ok: 'ok 1 should be truthy',
    notOk: 'not ok 2 should be falsy',
  },
  OUT: [
    '\x1B[1m\x1B[4mcomment\x1B[24m\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[32m✓\x1B[39m\x1B[22m \x1B[2mshould be truthy\x1B[22m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m 2) \x1B[31mshould be falsy\x1B[39m',
    '',
    '\x1B[1m\x1B[4mtest count(2) != plan(null)\x1B[24m\x1B[22m',
    '',
    '\x1B[31mFailed tests:\x1B[39m There were \x1B[31m2\x1B[39m failures',
    '',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m 2) \x1B[31mshould be falsy\x1B[39m',
    '\x1B[2m  \x1B[22m\x1B[2m  \x1B[22m\x1B[1m\x1B[31m✗\x1B[39m\x1B[22m undefined) \x1B[31mundefined\x1B[39m',
    '',
    'total:     2',
    '\x1B[32mpassing:   1\x1B[39m',
    '\x1B[31mfailing:   2\x1B[39m',
  ],
}

test('basic reporting', { todo: true }, (t) => {
  t.plan(1)
  const parser = tapArc({
    color: true,
    help: false,
    pessimistic: false,
    verbose: false,
  })
  const stream = new Readable({ read () {/* noop */} })

  let output = ''
  parser.on('data', (chunk) => {
    output += chunk.toString()
  })
  parser.on('end', () => {
    output = output.trim().split('\n').slice(0, -1).join('\n') // remove timer
    t.equal(output, TAP.OUT.join('\n'), 'should print expected output')
    t.end()
  })

  stream.pipe(parser)

  // simulate TAP
  stream.push(TAP.IN.comment)
  stream.push('\n')
  stream.push(TAP.IN.ok)
  stream.push('\n')
  stream.push(TAP.IN.notOk)
  stream.push(null)
})

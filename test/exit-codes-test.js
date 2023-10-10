import { exec } from 'child_process'
import { join } from 'path'
import test from 'tape'

const mockPath = join('.', 'test', 'mock')

test('streams and exit codes', (t) => {
  for (const ft of [ 'diff', 'mixed', 'simple', 'throws' ]) {
    const filename = `create-${ft}-tap.cjs`
    t.test(`exit(1) "${filename}" | tap-arc`, (t) => {
      t.plan(3)
      exec(
        `npx tape ${join(mockPath, filename)} | node src/index.js`,
        (error, stdout, stderr) => {
          t.ok(error, `"${filename}" creates an error`)
          t.notOk(stderr, 'stderror should be empty')
          t.ok(
            stdout.indexOf('Failed tests:') > 0,
            '"Failed tests:" should occur in output',
          )
        }
      )
    })
  }

  for (const ft of [ 'upstream-error', 'runtime-error' ]) {
    const filename = `create-${ft}-tap.cjs`
    t.test(`exit(1) "${filename}" | tap-arc`, (t) => {
      t.plan(3)
      exec(
        `npx tape ${join(mockPath, filename)} | node src/index.js`,
        (error, stdout, stderr) => {
          t.ok(error, `"${filename}" creates an error`)
          t.ok(stderr, 'stderror should not be empty')
          t.ok(stdout.indexOf('total:     0') > 0, '"total: 0" should occur in output')
        }
      )
    })
  }

  for (const pt of [ 'passing', 'empty' ]) {
    const filename = `create-${pt}-tap.cjs`
    t.test(`exit(0) "${filename}" | tap-arc`, (t) => {
      t.plan(3)
      exec(
        `npx tape ${join(mockPath, filename)} | node src/index.js`,
        (error, stdout, stderr) => {
          t.notOk(error, `${filename} exits without error`)
          t.notOk(stderr, 'stderror should be empty')
          t.ok(
            stdout.indexOf('Failed tests:') < 0,
            '"Failed tests:" shouldn\'t occur in output',
          )
        }
      )
    })
  }

  const badCountPassing = 'missing-assertions-passing.txt'
  t.test(`exit(0) "${badCountPassing}" | tap-arc`, (t) => {
    t.plan(3)
    exec(
      `cat ${join(mockPath, badCountPassing)} | node src/index.js`,
      (error, stdout, stderr) => {
        t.notOk(error, `"${badCountPassing}" exits without error`)
        t.notOk(stderr, 'stderror should be empty')
        t.ok(
          stdout.indexOf('Expected 16 assertions, parsed 13') > 0,
          '"Expected 16 assertions, parsed 13" should occur in output',
        )
      }
    )
  })
  t.test(`exit(1) "${badCountPassing}" | tap-arc --fail-bad-count`, (t) => {
    t.plan(3)
    exec(
      `cat ${join(mockPath, badCountPassing)} | node src/index.js --fail-bad-count`,
      (error, stdout, stderr) => {
        t.ok(error, `"${badCountFailing}" creates an error`)
        t.notOk(stderr, 'stderror should be empty')
        t.ok(
          stdout.indexOf('Expected 16 assertions, parsed 13') > 0,
          '"Expected 16 assertions, parsed 13" should occur in output',
        )
      }
    )
  })

  const badCountFailing = 'missing-assertions-failing.txt'
  t.test(`exit(1) "${badCountFailing}" | tap-arc`, (t) => {
    t.plan(3)
    exec(
      `cat ${join(mockPath, badCountFailing)} | node src/index.js`,
      (error, stdout, stderr) => {
        t.ok(error, `"${badCountFailing}" creates an error`)
        t.notOk(stderr, 'stderror should be empty')
        t.ok(
          stdout.indexOf('Failed tests:') > 0,
          '"Failed tests:" should occur in output',
        )
      }
    )
  })
})

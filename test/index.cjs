const { exec } = require('child_process')
const test = require('tape')

const failingTests = [ 'diff', 'mixed', 'simple', 'throws' ]
for (const ft of failingTests) {
  test(`exit(1) "${ft}" | tap-arc`, (t) => {
    exec(
      `npx tape ${__dirname}/create-${ft}-tap.cjs | ${__dirname}/../index.js`,
      (error, stdout, stderr) => {
        t.ok(error, `"${ft}" creates an error`)
        t.notOk(stderr, 'stderror should be empty')
        t.ok(stdout.indexOf('Failed tests:') > 0, '"Failed tests:" should occur in output')
        t.end()
      }
    )
  })
}

test.skip(`exit(1) "upstream-error" | tap-arc`, (t) => {
  exec(
    `npx tape ${__dirname}/create-upstream-error-tap.cjs | ${__dirname}/../index.js`,
    (error, stdout, stderr) => {
      t.ok(error, '"upstream" creates an error')
      t.ok(stderr, 'stderror should contain Node error')
      t.ok(stdout.indexOf('Failed tests:') < 0, '"Failed tests:" shouldn\'t occur in output')
      t.end()
    }
  )
})

const passingTests = [ 'passing', 'empty' ]
for (const pt of passingTests) {
  test(`exit(0) "${pt}" | tap-arc`, (t) => {
    exec(
      `npx tape ${__dirname}/create-${pt}-tap.cjs | ${__dirname}/../index.js`,
      (error, stdout, stderr) => {
        t.notOk(error, 'error should be undefined')
        t.notOk(stderr, 'stderror should be empty')
        t.ok(stdout.indexOf('Failed tests:') < 0, '"Failed tests:" shouldn\'t occur in output')
        t.end()
      }
    )
  })
}

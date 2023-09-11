const { exec } = require('child_process')
const test = require('tape')

const reporterPath = `${__dirname}/../index.js`


test('exit codes', (t) => {
  const failingTests = [ 'diff', 'mixed', 'simple', 'throws' ]
  for (const ft of failingTests) {
    t.test(`exit(1) "${ft}" | tap-arc`, (t) => {
      exec(
        `npx tape ${__dirname}/create-${ft}-tap.cjs | ${reporterPath}`,
        (error, stdout, stderr) => {
          t.ok(error, `"${ft}" creates an error`)
          t.notOk(stderr, 'stderror should be empty')
          t.ok(stdout.indexOf('Failed tests:') > 0, '"Failed tests:" should occur in output')
          t.end()
        }
      )
    })
  }

  const passingTests = [ 'passing', 'empty' ]
  for (const pt of passingTests) {
    t.test(`exit(0) "${pt}" | tap-arc`, (t) => {
      exec(
        `npx tape ${__dirname}/create-${pt}-tap.cjs | ${reporterPath}`,
        (error, stdout, stderr) => {
          t.notOk(error, 'error should be undefined')
          t.notOk(stderr, 'stderror should be empty')
          t.ok(stdout.indexOf('Failed tests:') < 0, '"Failed tests:" shouldn\'t occur in output')
          t.end()
        }
      )
    })
  }
})

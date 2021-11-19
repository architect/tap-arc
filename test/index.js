const { exec } = require('child_process')
const fs = require('fs')
const test = require('tape')
const ansiRegex = require('./util/ansi-regex.js')
const { scripts } = require('../package.json')

const commands = Object.keys(scripts)
  .filter((k) => k.indexOf('tap-arc:') === 0)
  .map((c) => c.split(':').slice(1))

function trimNLines (text, n) {
  const lines = text.split('\n')
  const trimmed = lines.splice(-1 * n)
  return [ lines.join('\n'), trimmed ]
}

for (const c of commands) {
  const [ command, flags = '' ] = c
  const name = `${command}${flags ? ` ${flags}` : ''}`

  test(`"${name}" tap-arc output matches "${name}" snapshot`, (t) => {
    const fullSnapshot = fs.readFileSync(`${__dirname}/snapshots/${command}${flags}.txt`)
    const [ trimmedSnapshot ] = trimNLines(fullSnapshot.toString(), 3)

    exec(
      `node ${__dirname}/create-${command}-tap.js | ${__dirname}/../index.js ${flags}`,
      (error, stdout, stderr) => {
        const strippedOut = stdout.replace(ansiRegex(), '')
        const [ trimmedOut, durationLines ] = trimNLines(strippedOut, 3)

        t.notOk(stderr, 'stderr should be empty')
        t.equal(trimmedOut, trimmedSnapshot, 'output matches snapshot')
        t.match(durationLines.join(''), /[0-9]+\s[ms|s]/, 'contains a duration')

        if (command.indexOf('pass') < 0)
        // expect exit code == 1 unless named with "pass"
          t.equal(error?.code, 1, `exit code 1 for "${name}" tests`)

        t.end()
      }
    )
  })
}

test('passing tests do not error', (t) => {
  exec(
    `node ${__dirname}/create-passing-tap.js | ${__dirname}/../index.js`,
    (error, stdout, stderr) => {
      const strippedOut = stdout.replace(ansiRegex(), '')
      t.notOk(error, 'error should be undefined')
      t.notOk(stderr, 'stderror should be empty')
      t.ok(strippedOut.indexOf('fail') < 0, '"fail" should not occur in output')
      t.end()
    }
  )
})

const { exec } = require('child_process')
const fs = require('fs')
const stripAnsi = require('strip-ansi')
const test = require('tape')
const { scripts } = require('../package.json')

const NODE_MAJOR_VERSION = Number.parseInt(process.versions.node.split('.')[0])

const commands = Object.keys(scripts)
  .filter((k) => k.indexOf('tap-arc:node-') === 0)
  .map((c) => c.split(':').slice(1))

function trimNLines (text, n) {
  const lines = text.split('\n')
  const trimmed = lines.splice(-1 * n)
  return [ lines.join('\n'), trimmed ]
}

for (const fullCommand of commands) {
  const commandName = fullCommand.join(' ')
  const [ command, flags = '' ] = fullCommand
  const [ name ] = command.split('-').slice(1)

  test(`"${commandName}" tap-arc output matches snapshot`, (t) => {
    const fullSnapshot = fs.readFileSync(`${__dirname}/snapshots/node/node${NODE_MAJOR_VERSION}/${name}${flags}.txt`)
    const [ trimmedSnapshot ] = trimNLines(fullSnapshot.toString(), 3)

    exec(
      `node ${__dirname}/fixtures/node/create-${name}-tap.mjs | ${__dirname}/../index.js ${flags}`,
      (error, stdout, stderr) => {
        const strippedOut = stripAnsi(stdout)
        const [ trimmedOut, durationLines ] = trimNLines(strippedOut, 3)

        if (command.indexOf('pass') >= 0)
          t.notOk(error, `"${commandName}" does not create an error`)
        else {
          // expect exit code == 1 unless named with "pass"
          t.ok(error, `"${commandName}" creates an error`)
          t.equal(error.code, 1, 'exit code is 1')
        }

        if (command.indexOf('error') < 0 && stderr.indexOf('ExperimentalWarning:') < 0)
          t.notOk(stderr, `"${commandName}" stderr should be empty`)

        t.equal(trimmedOut, trimmedSnapshot, `"${commandName}" output matches snapshot`)
        t.match(durationLines.join(''), /[0-9]+\s[ms|s]/, 'contains a duration')

        t.end()
      }
    )
  })
}

test('passing tests do not error', (t) => {
  exec(
    `node ${__dirname}/fixtures/node/create-passing-tap.mjs | ${__dirname}/../index.js`,
    (error, stdout, stderr) => {
      const strippedOut = stripAnsi(stdout)
      t.notOk(error, 'error should be undefined')
      t.notOk(stderr.indexOf('ExperimentalWarning:') < 0, 'stderror should be ExperimentalWarning')
      t.ok(strippedOut.indexOf('fail') < 0, '"fail" should not occur in output')
      t.end()
    }
  )
})

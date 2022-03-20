#!/usr/bin/env node

const fastdiff = require('fast-diff')
const JSON5 = require('json5')
const stringify = require('json-stable-stringify')
const minimist = require('minimist')
const Parser = require('tap-parser')
const stripAnsi = require('strip-ansi')
const through = require('through2')
const {
  bgGreen,
  bgRed,
  black,
  blue,
  bold,
  dim,
  green,
  red,
  underline,
  yellow,
} = require('picocolors')

const alias = {
  help: [ 'h', 'help' ],
  pessimistic: [ 'p', 'pessimistic', 'bail' ],
  verbose: [ 'v', 'verbose' ],
}
const options = {
  color: true,
  help: false,
  indent: 'dot',
  padding: 'space',
  pessimistic: false,
  verbose: false,
  ...minimist(process.argv.slice(2), { alias })
}

if (options.help) {
  console.log(`
Usage:
  tap-arc <options>

Parses TAP data from stdin, and outputs a "spec-like" formatted result.

Options:

  -v | --verbose
    Output full stack trace

  -p | --pessimistic | --bail
    Immediately exit upon encountering a failure
    example: tap-arc -p

  --no-color
    Output without ANSI escape sequences for colors
    example: tap-arc --no-color

  --padding [space, dot, <custom characters>]
    String to use when padding output (default="  ")
    example: tap-arc --padding "••"
    example: tap-arc --padding dot

  --indent [space, dot, <custom characters>]
    String to use when indenting Object diffs (default="··")
    example: tap-arc --indent ">>"
    example: tap-arc --indent space`)
  process.exit()
}

switch (options.indent) {
case 'dot': options.indent = '··'; break
case 'space': options.indent = '  '; break
}

switch (options.padding) {
case 'dot':options.padding = '··'; break
case 'space':options.padding = '  '; break
}

const parser = new Parser({ bail: options.pessimistic })
const tapArc = through()
const cwd = process.cwd()
const start = Date.now()
const OKAY = green('✔')
const FAIL = red('✖')

function pad (count = 1, char) {
  return dim(char || options.padding).repeat(count)
}

function makeDiff (actual, expected, indent = '  ') {
  let msg = []
  let isJson = true
  let actualJson = actual
  let expectedJson = expected

  try {
    actualJson = JSON5.parse(actual)
    expectedJson = JSON5.parse(expected)
  }
  catch (e) {
    isJson = false
  }

  const diff = fastdiff(
    stringify(isJson ? actualJson : actual, { space: indent }),
    stringify(isJson ? expectedJson : expected, { space: indent })
  )

  for (const part of diff) {
    // the diff objects can span lines
    // separate lines before styling for tidier output
    const lines = part[1].split('\n')

    if (part[0] === 1) msg.push(lines.map((s) => black(bgGreen(s))).join('\n'))
    else if (part[0] === -1) msg.push(lines.map((s) => black(bgRed(s))).join('\n'))
    else msg.push(lines.map((s) => s.replace(new RegExp(indent, 'g'), dim(indent))).join('\n'))
  }

  return msg.join('').split(/\n/) // as separate lines
}

function print (msg) {
  tapArc.push(options.color ? msg : stripAnsi(msg))
}

function prettyMs (start) {
  const ms = Date.now() - start
  return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`
}

parser.on('pass', (pass) => {
  print(`${pad(2)}${OKAY} ${dim(pass.name)}\n`)
})

parser.on('skip', (skip) => {
  print(`${pad(2)}${dim(`SKIP ${skip.name}`)}\n`)
})

parser.on('extra', (extra) => {
  const stripped = stripAnsi(extra).trim()
  const justAnsi = stripped.length === 0 && extra.length > 0
  if (!justAnsi) print(`${pad(2)}${extra}`)
})

parser.on('comment', (comment) => {
  // Log test-group name
  const RESULT_COMMENTS = [ 'tests ', 'pass ', 'skip', 'todo', 'fail ', 'failed ', 'ok' ]
  if (!RESULT_COMMENTS.some((c) => comment.startsWith(c, 2)))
    print(`\n${pad()}${underline(comment.trimEnd().replace(/^(# )/, ''))}\n`)
})

parser.on('todo', (todo) => {
  if (todo.ok) print(`${pad(2)}${yellow('TODO')} ${dim(todo.name)}\n`)
  else print(`${pad(2)}${red('TODO')} ${dim(todo.name)}\n`)
})

parser.on('fail', (fail) => {
  print(`${pad(2)}${FAIL} ${dim(`${fail.id})`)} ${red(fail.name)}\n`)

  if (fail.diag) {
    const { actual, at, expected, operator, stack } = fail.diag
    let msg = [] // individual lines of output

    if ([ 'equal', 'deepEqual' ].includes(operator)) {
      if (typeof expected === 'string' && typeof actual === 'string') {
        msg = [ ...msg, ...makeDiff(actual, expected, options.indent) ]
      }
      else if (typeof expected === 'object' && typeof actual === 'object') {
        // probably an array
        msg = [ ...msg, ...makeDiff(actual, expected, options.indent) ]
      }
      else if (typeof expected === 'number' || typeof actual === 'number') {
        msg.push(`Expected ${green(expected)} but got ${red(actual)}`)
      }
      else {
        // mixed types
        msg.push(`operator: ${red(operator)}`)
        msg.push(`expected: ${green(expected)} <${typeof expected}>`)
        msg.push(`actual: ${red(actual)} <${typeof actual}>`)
      }
    }
    else if ([ 'notEqual', 'notDeepEqual' ].includes(operator)) {
      msg.push('Expected values to differ')
    }
    else if (operator === 'ok') {
      msg.push(`Expected ${green('truthy')} but got ${red(actual)}`)
    }
    else if (operator === 'match') {
      msg.push(`Expected ${red(actual)} to match ${blue(expected)}`)
    }
    else if (operator === 'doesNotMatch') {
      msg.push(`Expected ${red(actual)} to not match ${blue(expected)}`)
    }
    else if (operator === 'throws' && actual && actual !== 'undefined') {
      // this combination is ~doesNotThrow
      msg.push(`Expected to not throw, received "${red(actual)}"`)
    }
    else if (operator === 'throws') {
      msg.push('Expected to throw')
    }
    else if (operator === 'error') {
      msg.push(`Expected error to be ${green('falsy')}`)
    }
    else if (expected && !actual) {
      msg.push(`Expected ${red(operator)} but got nothing`)
    }
    else if (actual && !expected) {
      msg.push(`Expected ${green('falsy')} but got ${red(actual)}`)
    }
    else if (expected && actual) {
      msg.push(`Expected ${green(expected)} but got ${red(actual)}`)
    }
    else if (operator === 'fail') {
      msg.push('Explicit fail')
    }
    else if (!expected && !actual) {
      msg.push(`operator: ${red(operator)}`)
    }
    else {
      // unlikely
      msg.push(`operator: ${red(operator)}`)
      msg.push(`expected: ${green(expected)}`)
      msg.push(`actual: ${red(actual)}`)
    }

    if (at) msg.push(`${dim(`At: ${at.replace(cwd, '')}`)}`)

    if (options.verbose && stack) {
      msg.push('')
      stack.split('\n').forEach((s) => {
        msg.push(dim(s.trim().replace(cwd, '')))
      })
    }

    msg.push('')

    // final formatting, each entry must be a single line
    msg = msg.map((line) => `${pad(3)}${line}\n`)

    print(msg.join(''))
  }
})

parser.on('complete', (result) => {
  if (!result.ok) {
    let failureSummary = '\n'
    failureSummary += `${pad()}${red('Failed tests:')}`
    failureSummary += ` There ${result.fail > 1 ? 'were' : 'was'} `
    failureSummary += red(result.fail)
    failureSummary += ` failure${result.fail > 1 ? 's' : ''}\n\n`

    print(failureSummary)

    for (const fail of result.failures) {
      print(`${pad(2)}${FAIL} ${dim(`${fail.id})`)} ${fail.name}\n`)
    }
  }

  print(`\n${pad()}total:     ${result.count}\n`)
  if (result.pass > 0) print(green(`${pad()}passing:   ${result.pass}\n`))
  if (result.fail > 0) print(red(`${pad()}failing:   ${result.fail}\n`))
  if (result.skip > 0) print(`${pad()}skipped:   ${result.skip}\n`)
  if (result.todo > 0) print(`${pad()}todo:      ${result.todo}\n`)
  if (result.bailout) print(`${pad()}${bold(underline(red('BAILED!')))}\n`)

  tapArc.end(`${dim(`${pad()}${prettyMs(start)}`)}\n\n`)

  process.exit(result.ok ? 0 : 1)
})

process.stdin.pipe(parser).pipe(tapArc).pipe(process.stdout)

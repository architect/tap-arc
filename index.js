#!/usr/bin/env node

const JSON5 = require('json5')
const minimist = require('minimist')
const Parser = require('tap-parser')
const stripAnsi = require('strip-ansi')
const through = require('through2')
const { strict } = require('tcompare')
const {
  blue,
  bold,
  dim,
  green,
  inverse,
  red,
  underline,
  yellow,
} = require('picocolors')

// Log test-group name
const RESULT_COMMENTS = [ 'tests ', 'pass ', 'skip', 'todo', 'fail ', 'failed ', 'ok' ]

const alias = {
  help: [ 'h', 'help' ],
  pessimistic: [ 'p', 'pessimistic', 'bail' ],
  verbose: [ 'v', 'verbose' ],
}
const options = {
  color: true,
  help: false,
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
    example: tap-arc --no-color`)
  process.exit()
}

const parser = new Parser({ bail: options.pessimistic })
const tapArc = through()
const cwd = process.cwd()
const start = Date.now()
const OKAY = green('✔')
const FAIL = red('✖')

function pad (count = 1, char = '  ') {
  return dim(char).repeat(count)
}

function makeDiff (lhs, rhs, options) {
  const { verbose } = options
  const msg = []
  let isJson = true
  let pLhs = lhs
  let pRhs = rhs

  try {
    pLhs = JSON5.parse(lhs)
    pRhs = JSON5.parse(rhs)
  }
  catch (e) {
    isJson = false
  }

  if (isJson) {
    lhs = pLhs
    rhs = pRhs
  }

  const compared = strict(
    lhs,
    rhs,
    {
      includeEnumerable: true,
      includeGetters: true,
      pretty: true,
      sort: true
    }
  )

  if (!compared.match) {
    // capture diff after line: "@@ -n,n +n,n @@"
    const diff = verbose
      ? compared.diff
      : compared.diff.split(/^(?:@@).*(?:@@)$/gm)[1]

    for (const line of diff.split('\n')) {
      if (line.indexOf('--- ') === 0)
        msg.push(inverse(red(line)))
      else if (line.indexOf('+++ ') === 0)
        msg.push(inverse(green(line)))
      else if (line.charAt(0) === '-')
        msg.push(red(line))
      else if (line.charAt(0) === '+')
        msg.push(green(line))
      else
        msg.push(line)
    }
  }
  else {
    msg.push(`${red('Expected')} did not match ${green('actual')}.`)
  }

  return msg
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
        msg = [ ...msg, ...makeDiff(actual, expected, options) ]
      }
      else if (typeof expected === 'object' && typeof actual === 'object') {
        // probably an array
        msg = [ ...msg, ...makeDiff(actual, expected, options) ]
      }
      else if (typeof expected === 'number' || typeof actual === 'number') {
        msg.push(`Expected ${red(expected)} but got ${green(actual)}`)
      }
      else {
        // mixed types
        msg.push(`operator: ${operator}`)
        msg.push(`expected: ${red(`- ${expected}`)} <${typeof expected}>`)
        msg.push(`actual: ${green(`+ ${actual}`)} <${typeof actual}>`)
      }
    }
    else if ([ 'notEqual', 'notDeepEqual' ].includes(operator)) {
      msg.push('Expected values to differ')
    }
    else if (operator === 'ok') {
      msg.push(`Expected ${blue('truthy')} but got ${green(actual)}`)
    }
    else if (operator === 'match') {
      msg.push(`Expected "${actual}" to match ${blue(expected)}`)
    }
    else if (operator === 'doesNotMatch') {
      msg.push(`Expected "${actual}" to not match ${blue(expected)}`)
    }
    else if (operator === 'throws' && actual && actual !== 'undefined') {
      // this combination is ~doesNotThrow
      msg.push(`Expected to not throw, received "${green(actual)}"`)
    }
    else if (operator === 'throws') {
      msg.push('Expected to throw')
    }
    else if (operator === 'error') {
      msg.push(`Expected error to be ${blue('falsy')}`)
    }
    else if (expected && !actual) {
      msg.push(`Expected ${red(operator)} but got nothing`)
    }
    else if (actual && !expected) {
      msg.push(`Expected ${blue('falsy')} but got ${green(actual)}`)
    }
    else if (expected && actual) {
      msg.push(`Expected ${red(expected)} but got ${green(actual)}`)
    }
    else if (operator === 'fail') {
      msg.push('Explicit fail')
    }
    else if (!expected && !actual) {
      msg.push(`operator: ${yellow(operator)}`)
    }
    else {
      // unlikely
      msg.push(`operator: ${yellow(operator)}`)
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

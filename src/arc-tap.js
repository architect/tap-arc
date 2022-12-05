import { Chalk } from 'chalk'
import { Parser } from 'tap-parser'
import stripAnsi from 'strip-ansi'
import createMakeDiff from './_make-diff.js'

export default function createParser (options) {
  const chalk = new Chalk({ level: options.color ? 3 : 0 })
  const {
    // bgGreen,
    bgRed,
    // bgWhite,
    bgYellow,
    blue,
    bold,
    dim,
    green,
    italic,
    // orange,
    red,
    underline,
    yellow,
  } = chalk
  const makeDiff = createMakeDiff({ red, green, dim: italic.dim })
  const parser = new Parser({ bail: options.pessimistic })
  const cwd = process.cwd()
  const start = Date.now()
  const OKAY = green('✔')
  const FAIL = red('✖')

  function pad (count = 1, char = '  ') {
    return dim(char).repeat(count)
  }

  function print (msg) {
    process.stdout.write(msg)
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
    if (!justAnsi) {
      print(`${pad(2)}${extra}`)
    }
  })

  const reservedCommentLeaders = [
    'tests ',
    'pass ',
    'skip',
    'todo',
    'fail ',
    'failed ',
    'ok',
  ]
  parser.on('comment', (comment) => {
    if (!reservedCommentLeaders.some((c) => comment.startsWith(c, 2))) {
      print(`\n${pad()}${underline(comment.trimEnd().replace(/^(# )/, ''))}\n`)
    }
  })

  parser.on('todo', (todo) => {
    if (todo.ok) {
      print(`${pad(2)}${yellow('TODO')} ${dim(todo.name)}\n`)
    }
    else {
      print(`${pad(2)}${red('TODO')} ${dim(todo.name)}\n`)
    }
  })

  parser.on('fail', (fail) => {
    print(`${pad(2)}${FAIL} ${dim(`${fail.id})`)} ${red(fail.name)}\n`)

    if (fail.diag) {
      const { actual, at, expected, operator, stack } = fail.diag
      let msg = [] // individual lines of output

      if ([ 'equal', 'deepEqual' ].includes(operator)) {
        if (typeof expected === 'string' && typeof actual === 'string') {
          msg = [ ...msg, ...makeDiff(actual, expected) ]
        }
        else if (typeof expected === 'object' && typeof actual === 'object') {
        // probably an array
          msg = [ ...msg, ...makeDiff(actual, expected) ]
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
      else if (
        operator === 'throws' &&
			actual &&
			actual !== 'undefined' &&
			expected &&
			expected !== 'undefined'
      ) {
      // this combination is throws with expected/assertion
        msg.push(
          `Expected ${red(expected)} to match "${green(
            actual.message || actual,
          )}"`,
        )
      }

      switch (operator) {
      case 'equal': {
        msg.push(bgRed.white(' equal '))
        break
      }
      case 'deepEqual': {
        msg.push(bgRed.white(' deepEqual '))
        break
      }
      case 'notEqual': {
        msg.push(bgRed.white(' notEqual '))
        msg.push('Expected values to differ')
        break
      }
      case 'notDeepEqual': {
        msg.push(bgRed.white(' notDeepEqual '))
        msg.push('Expected values to differ')
        break
      }
      case 'ok': {
        msg.push(bgRed.white(' ok '))
        msg.push(`Expected ${blue('truthy')} but got ${green(actual)}`)
        break
      }
      case 'match': {
        msg.push(bgRed.white(' match '))
        msg.push(`Expected "${actual}" to match ${blue(expected)}`)
        break
      }
      case 'doesNotMatch': {
        msg.push(bgRed.white(' doesNotMatch '))
        msg.push(`Expected "${actual}" to not match ${blue(expected)}`)
        break
      }
      case 'throws': {
        msg.push(bgRed.white(' throws '))
        if (actual && actual !== 'undefined') {
        // this combination is ~doesNotThrow
          msg.push(`Expected to not throw, received "${green(actual)}"`)
        }
        else {
          msg.push('Expected to throw')
        }
        break
      }
      case 'error': {
        msg.push(bgRed.white(' error '))
        msg.push(`Expected error to be ${blue('falsy')}`)
        break
      }
      case 'fail': {
        msg.push(bgRed.white(' fail '))
        msg.push('Explicit fail')
        break
      }

      default: {
        msg.push(bgYellow.black(` ${operator} `))
        if (expected && !actual) {
          msg.push(`Expected ${red(operator)} but got nothing`)
        }
        else if (actual && !expected) {
          msg.push(`Expected ${blue('falsy')} but got ${green(actual)}`)
        }
        if (expected && actual) {
          msg.push(`Expected ${red(expected)} but got ${green(actual)}`)
        }
        else if (expected || actual) {
        // unlikely
          msg.push(`operator: ${yellow(operator)}`)
          msg.push(`expected: ${green(expected)}`)
          msg.push(`actual: ${red(actual)}`)
        }
        else {
          msg.push(`operator: ${yellow(operator)}`)
        }
        break
      }
      }

      if (at) {
        msg.push(`${dim(`At: ${at.replace(cwd, '')}`)}`)
      }

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
    if (result.pass > 0) {
      print(green(`${pad()}passing:   ${result.pass}\n`))
    }
    if (result.fail > 0) {
      print(red(`${pad()}failing:   ${result.fail}\n`))
    }
    if (result.skip > 0) {
      print(`${pad()}skipped:   ${result.skip}\n`)
    }
    if (result.todo > 0) {
      print(`${pad()}todo:      ${result.todo}\n`)
    }
    if (result.bailout) {
      print(`${pad()}${bold.underline.red('BAILED!')}\n`)
    }

    console.log(`${dim(`${pad()}${prettyMs(start)}`)}\n\n`)

    process.exit(result.ok && result.count > 0 ? 0 : 1)
  })

  return parser
}

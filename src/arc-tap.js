import { Parser } from 'tap-parser'
import stripAnsi from 'strip-ansi'
import createMakeDiff from './_make-diff.js'
import createPrinter from './_printer.js'

export default function createParser (options, callback) {
  const $ = createPrinter(options)
  const { print: $$ } = $
  const makeDiff = createMakeDiff($.diffOptions)
  const parser = new Parser({ bail: options.pessimistic })
  const cwd = process.cwd()
  const start = Date.now()

  parser.on('pass', (test) => {
    $$($.pass(test.name), 2)
  })

  parser.on('skip', (test) => {
    $$($.skip(test.name), 2)
  })

  parser.on('todo', (test) => {
    $$($.todo(test.name, test.ok), 2)
  })

  parser.on('extra', (extra) => {
    // typically `console.log` output from the test or program it tests
    const stripped = stripAnsi(extra).trim()
    const justAnsi = stripped.length === 0 && extra.length > 0
    if (!justAnsi) $$(extra.trim())
  })

  const reservedCommentPrefixes = [ 'tests ', 'pass ', 'skip', 'todo', 'fail ', 'failed ', 'ok' ]
  parser.on('comment', (comment) => {
    if (!reservedCommentPrefixes.some((c) => comment.startsWith(c, 2))) {
      // "comment" is a test group title
      $$(`\n${$.title(comment.trimEnd().replace(/^(# )/, ''))}`)
    }
  })

  parser.on('fail', (test) => {
    $$($.fail(test.name, test.id), 2)

    if (test.diag) {
      const { actual, at, expected, operator, stack } = test.diag
      const I = 4

      if (operator === 'equal' || operator === 'deepEqual') {
        if (typeof expected === 'string' && typeof actual === 'string') {
          for (const line of makeDiff(actual, expected)) {
            $$(line, I)
          }
        }
        else if (typeof expected === 'object' && typeof actual === 'object') {
          // probably an array
          for (const line of makeDiff(actual, expected)) {
            $$(line, I)
          }
        }
        else if (typeof expected === 'number' || typeof actual === 'number') {
          $$(`Expected ${$.expected(expected)} but got ${$.actual(actual)}`, I)
        }
        else {
          // mixed types
          $$(`operator: ${operator}`, I)
          $$(`expected: ${$.expected(`- ${expected}`)} <${typeof expected}>`, I)
          $$(`actual: ${$.actual(`+ ${actual}`)} <${typeof actual}>`, I)
        }
      }
      else if (operator === 'throws' && actual && actual !== 'undefined' && expected && expected !== 'undefined') {
        // this combination is throws with expected/assertion
        $$(`Expected ${$.expected(expected)} to match "${$.actual(actual.message || actual)}"`, I)
      }

      switch (operator) {
      case 'equal': {
        break
      }
      case 'deepEqual': {
        break
      }
      case 'notEqual': {
        $$('Expected values to differ', I)
        break
      }
      case 'notDeepEqual': {
        $$('Expected values to differ', I)
        break
      }
      case 'ok': {
        $$(`Expected ${$.highlight('truthy')} but got ${$.actual(actual)}`, I)
        break
      }
      case 'match': {
        $$(`Expected "${actual}" to match ${$.highlight(expected)}`, I)
        break
      }
      case 'doesNotMatch': {
        $$(`Expected "${actual}" to not match ${$.highlight(expected)}`, I)
        break
      }
      case 'throws': {
        if (actual && actual !== 'undefined') {
          // this combination is ~doesNotThrow
          $$(`Expected to not throw, received "${$.actual(actual)}"`, I)
        }
        else {
          $$('Expected to throw', I)
        }
        break
      }
      case 'error': {
        $$(`Expected error to be ${$.highlight('falsy')}`, I)
        break
      }
      case 'fail': {
        $$('Explicit fail', I)
        break
      }

      default: {
        if (expected && !actual) $$(`Expected ${$.expected(operator)} but got nothing`, I)
        else if (actual && !expected) $$(`Expected ${$.highlight('falsy')} but got ${$.actual(actual)}`, I)

        if (expected && actual) $$(`Expected ${$.expected(expected)} but got ${$.actual(actual)}`, I)
        else if (expected || actual) {
          // unlikely
          $$(`operator: ${operator}`, I)
          $$(`expected: ${$.expected(expected)}`, I)
          $$(`actual: ${$.actual(actual)}`, I)
        }
        else {
          $$(`operator: ${operator}`, I)
        }
        break
      }
      }

      if (at) $$(`${$.dim(`At: ${at.replace(cwd, '')}`)}`, I)

      if (options.verbose && stack) {
        stack.split('\n').forEach((s) => {
          $$($.dim(s.trim().replace(cwd, '')), I)
        })
      }
    }
  })

  parser.on('complete', (result) => {
    if (!result.ok) {
      let failureSummary = '\n'
      failureSummary += `${$.bad('Failed tests:')}`
      failureSummary += ` There ${result.fail > 1 ? 'were' : 'was'} `
      failureSummary += $.bad(result.fail)
      failureSummary += ` failure${result.fail > 1 ? 's' : ''}\n`

      $$(failureSummary)

      for (const test of result.failures) $$($.fail(test.name, test.id), 2)
    }

    $$(`\ntotal:     ${result.count}`)
    if (result.pass > 0) $$($.good(`passing:   ${result.pass}`))
    if (result.fail > 0) $$($.bad(`failing:   ${result.fail}`))
    if (result.skip > 0) $$(`skipped:   ${result.skip}`)
    if (result.todo > 0) $$(`todo:      ${result.todo}`)
    if (result.bailout) $$(`${$.bail('BAILED!')}`)

    $$(`${$.dim(`${$.prettyMs(start)}`)}\n`)

    callback(null, result)
  })

  return parser
}

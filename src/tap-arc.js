import { PassThrough } from 'stream'
import { Parser } from 'tap-parser'
import duplexer from 'duplexer3' // TODO: write a custom, simpler duplexer
import stripAnsi from 'strip-ansi'
import createMakeDiff from './_make-diff.js'
import createPrinter from './_printer.js'

const reservedCommentPrefixes = [ 'tests ', 'pass ', 'skip', 'todo', 'fail ', 'failed ', 'ok', 'test count' ]

export default function createParser (options) {
  const { debug, pessimistic, verbose } = options
  const output = new PassThrough()
  const parser = new Parser({ bail: pessimistic })
  const stream = duplexer(parser, output)

  const _ = createPrinter(options, output)
  const { diffOptions, print: P } = _
  const makeDiff = createMakeDiff(diffOptions)

  const cwd = process.cwd()
  const start = Date.now()

  const counter = {
    pass: 0,
    skip: 0,
    todo: 0,
    fail: 0,
  }

  parser.on('comment', (comment) => {
    if (!reservedCommentPrefixes.some((c) => comment.startsWith(c, 2))) {
      // "comment" is generally a test group name
      P(`\n${_.title(comment.trimEnd().replace(/^(# )/, ''))}`)
    }
  })

  parser.on('extra', (extra) => {
    // typically `console.log` output from the test or program it tests
    const stripped = stripAnsi(extra).trim()
    const justAnsi = stripped.length === 0 && extra.length > 0
    if (!justAnsi) P(extra, 0, 0)
  })

  parser.on('pass', (test) => {
    counter.pass++
    P(_.pass(test), 2)
  })

  parser.on('skip', (test) => {
    counter.skip++
    P(_.skip(test), 2)
  })

  parser.on('todo', (test) => {
    counter.todo++
    P(_.todo(test), 2)
  })

  parser.on('fail', (test) => {
    counter.fail++
    P(_.fail(test), 2)

    if (test.diag) {
      const { actual, at, expected, operator, stack } = test.diag
      const I = 4

      if (operator === 'equal' || operator === 'deepEqual') {
        if (typeof expected === 'string' && typeof actual === 'string') {
          for (const line of makeDiff(actual, expected)) {
            P(line, I)
          }
        }
        else if (typeof expected === 'object' && typeof actual === 'object') {
          // probably an array
          for (const line of makeDiff(actual, expected)) {
            P(line, I)
          }
        }
        else if (typeof expected === 'number' || typeof actual === 'number') {
          P(`Expected ${_.expected(expected)} but got ${_.actual(actual)}`, I)
        }
        else {
          // mixed types
          P(`operator: ${operator}`, I)
          P(`expected: ${_.expected(`- ${expected}`)} <${typeof expected}>`, I)
          P(`actual: ${_.actual(`+ ${actual}`)} <${typeof actual}>`, I)
        }
      }
      else if (operator === 'throws' && actual && actual !== 'undefined' && expected && expected !== 'undefined') {
        // this combination is throws with expected/assertion
        P(`Expected ${_.expected(expected)} to match "${_.actual(actual.message || actual)}"`, I)
      }

      switch (operator) {
      case 'equal': {
        break
      }
      case 'deepEqual': {
        break
      }
      case 'notEqual': {
        P('Expected values to differ', I)
        break
      }
      case 'notDeepEqual': {
        P('Expected values to differ', I)
        break
      }
      case 'ok': {
        P(`Expected ${_.highlight('truthy')} but got ${_.actual(actual)}`, I)
        break
      }
      case 'match': {
        P(`Expected "${actual}" to match ${_.highlight(expected)}`, I)
        break
      }
      case 'doesNotMatch': {
        P(`Expected "${actual}" to not match ${_.highlight(expected)}`, I)
        break
      }
      case 'throws': {
        if (actual && actual !== 'undefined') {
          // this combination is ~doesNotThrow
          P(`Expected to not throw, received "${_.actual(actual)}"`, I)
        }
        else {
          P('Expected to throw', I)
        }
        break
      }
      case 'error': {
        P(`Expected error to be ${_.highlight('falsy')}`, I)
        break
      }
      case 'fail': {
        P('Explicit fail', I)
        break
      }

      default: {
        if (expected && !actual) P(`Expected ${_.expected(operator)} but got nothing`, I)
        else if (actual && !expected) P(`Expected ${_.highlight('falsy')} but got ${_.actual(actual)}`, I)

        if (expected && actual) P(`Expected ${_.expected(expected)} but got ${_.actual(actual)}`, I)
        else if (expected || actual) {
          // unlikely
          P(`operator: ${operator}`, I)
          P(`expected: ${_.expected(expected)}`, I)
          P(`actual: ${_.actual(actual)}`, I)
        }
        else {
          P(`operator: ${operator}`, I)
        }
        break
      }
      }

      if (at) P(_.dim(`At: ${at.replace(cwd, '')}`), I)

      if (verbose && stack) {
        stack.split('\n').forEach((s) => {
          P(_.dim(s.trim().replace(cwd, '')), I)
        })
      }
    }
  })

  parser.on('complete', (result) => {
    if (!result.ok) {
      if (
        result.failures[0] &&
        result.failures[0].tapError &&
        result.failures[0].tapError.startsWith('incorrect number of tests')
      ) {
        // custom failure was created by tap-parser
        result.badCount = true // persisted to CLI process handler
        result.failures.shift()
        result.fail--
        P(_.realBad(`\nExpected ${result.plan.end || '?'} assertions, parsed ${result.count || '?'}`))
      }

      if (result.failures.length > 0) {
        const singular = result.fail === 1
        let failureSummary = '\n'
        failureSummary += _.bad('Failed tests:')
        failureSummary += ` There ${singular ? 'was' : 'were'} `
        failureSummary += _.bad(result.fail)
        failureSummary += ` failure${singular ? '' : 's'}\n`

        P(failureSummary)

        for (const test of result.failures) P(_.fail(test), 2)
      }
    }

    P(`\ntotal:     ${result.count}`)
    if (result.bailout) P(_.realBad('BAILED!'))
    if (result.pass > 0) P(_.good(`passing:   ${result.pass}`))
    if (result.fail > 0) P(_.bad(`failing:   ${result.fail}`))
    if (result.skip > 0) P(`skipped:   ${result.skip}`)
    if (result.todo > 0) P(`todo:      ${result.todo}`)

    if (debug) {
      P('tap-parser result:')
      P(JSON.stringify(result, null, 2))
      P('tap-arc internal counters:')
      P(JSON.stringify(counter, null, 2))
    }

    _.end(start)
  })

  if (verbose) {
    parser.on('version', (version) => {
      P(`${_.strong('TAP version:')} ${version}`)
    })
    parser.on('plan', (plan) => {
      const { start, end, comment } = plan
      P(`${_.strong('Plan:')} start=${start} end=${end} ${comment ? `"${comment}"` : ''}`)
    })
  }

  if (debug) {
    parser.on('line', (line) => {
      P(line.trim())
    })
  }

  return stream
}

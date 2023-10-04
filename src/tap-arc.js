// eslint-disable-next-line import/no-unresolved
import { Parser } from 'tap-parser' // what's going on with @tapjs packages?
import { PassThrough } from 'stream'
import duplexer from 'duplexer3' // TODO: write a custom, simpler duplexer
import stripAnsi from 'strip-ansi'
import differ from './_make-diff.js'
import createPrinter from './_printer.js'

const reservedCommentPrefixes = [ 'tests ', 'pass ', 'skip', 'todo', 'fail ', 'failed ', 'ok', 'test count' ]

export default function createParser (options) {
  const { debug, pessimistic, showDiff, verbose } = options
  const output = new PassThrough()
  const parser = new Parser({ bail: pessimistic })
  const stream = duplexer(parser, output)
  const _ = createPrinter(options)
  const { prettyMs, pad } = _
  const { diffArray, diffObject, diffUnknown } = differ(_)

  /**
   * Print a line to the output stream
   * @param {string} str
   * @param {number} p padding
   * @param {number} n newlines
   * @returns void
   */
  function P (str, p = 0, n = 1) {
    output.write(`${pad(p)}${str}${'\n'.repeat(n)}`)
  }

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
      const aType = typeof actual
      const eType = typeof expected
      const sharedType = aType === eType ? aType : null
      const indent = 4

      if (operator === 'equal' || operator === 'deepEqual') {
        if (sharedType === 'number') {
          // tap-parser parses numbers from TAP output
          P(`Expected ${_.expected(expected)} but got ${_.actual(actual)}`, indent)
        }
        else if (Array.isArray(expected) && Array.isArray(actual)) {
          // tap-parser parses arrays from TAP output
          if (showDiff) {
            diffArray(actual, expected).forEach(line => P(line, indent))
          }
          else {
            P(`Expect: ${_.expected(expected)}`, indent)
            P(`Actual: ${_.actual(actual)}`, indent)
          }

        }
        else if (sharedType === 'object') {
          // likely impossible to get parsed object from output
          if (showDiff) {
            diffObject(actual, expected).forEach(line => P(line, indent))
          }
          else {
            P(`Expect: ${_.expected(expected)}`, indent)
            P(`Actual: ${_.actual(actual)}`, indent)
          }
        }
        else if (sharedType === 'string') {
          // most common case - strings all the way down
          if (showDiff) {
            diffUnknown(actual, expected).forEach(line => P(line, indent))
          }
          else {
            P(`Expect: ${_.expected(expected)}`, indent)
            P(`Actual: ${_.actual(actual)}`, indent)
          }
        }
        else {
          // mixed types
          P(`Expect: ${_.expected(expected)} <${eType}>`, indent)
          P(`Actual: ${_.actual(actual)} <${aType}>`, indent)
        }
      }
      else if (
        operator === 'throws'
        && actual
        && actual !== 'undefined'
        && expected
        && expected !== 'undefined'
      ) {
        // this weird combination is throws with expected/assertion
        P(`Expected ${_.expected(expected)} to match "${_.actual(actual.message || actual)}"`, indent)
      }

      switch (operator) {
      case 'equal': {
        break
      }
      case 'deepEqual': {
        break
      }
      case 'notEqual': {
        P('Expected values to differ', indent)
        break
      }
      case 'notDeepEqual': {
        P('Expected values to differ', indent)
        break
      }
      case 'ok': {
        P(`Expected ${_.expected('truthy')} but got ${_.actual(actual)}`, indent)
        break
      }
      case 'match': {
        P(`Expected "${_.actual(actual)}" to match ${_.expected(expected)}`, indent)
        break
      }
      case 'doesNotMatch': {
        P(`Expected "${_.actual(actual)}" to not match ${_.expected(expected)}`, indent)
        break
      }
      case 'throws': {
        if (actual && actual !== 'undefined') {
          // this combination is usually "doesNotThrow"
          P(`Expected to not throw, received "${_.actual(actual)}"`, indent)
        }
        else {
          P('Expected to throw', indent)
        }
        break
      }
      case 'error': {
        P(`Expected error to be ${_.expected('falsy')}`, indent)
        break
      }
      case 'fail': {
        P('Explicit fail', indent)
        break
      }
      default: {
        if (expected && actual) {
          P(`Expected ${_.expected(expected)} but got ${_.actual(actual)}`, indent)
        }
        else if (expected && !actual) {
          P(`Expected ${_.expected(operator)} but got nothing`, indent)
        }
        else if (actual && !expected) {
          P(`Expected ${_.expected('falsy')} but got ${_.actual(actual)}`, indent)
        }
        else {
          P(`Operator: ${operator}`, indent)
        }
        break
      }
      }

      if (at) P(_.dim(`At: ${at.replace(cwd, '')}`), indent)

      if (stack && verbose) {
        stack.split('\n').forEach((s) => {
          P(_.dim(s.trim().replace(cwd, '')), indent)
        })
      }
    }
  })

  parser.on('complete', (result) => {
    if (!result.ok) {
      const tapFailures = result.failures.filter((f) => f.tapError)
      for (const tapFailure of tapFailures) {
        const { tapError } = tapFailure

        if (tapError.startsWith('incorrect number of tests')) {
          // custom failure was created by tap-parser
          P(_.realBad(`\nExpected ${result.plan.end || '?'} assertions, parsed ${result.count || '?'}`))
          result.badCount = true // persisted to CLI process handler
          result.failures.shift()
          result.fail--
        }
        else if (tapError.startsWith('no plan'))
          P(_.realBad(`\nTAP test plan not found`))
        else
          P(_.realBad(`\n${tapError}`))
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

    output.end(`${_.dim(prettyMs(start))}\n`)
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

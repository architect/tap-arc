import TapReader from 'tap-reader'
import JSON5 from 'json5'
import stripAnsi from 'strip-ansi'
import createDiffer from './_make-diff.js'
import createPrinter from './_printer.js'

const { parse } = JSON5
const tapeCommentPrefixes = [ 'tests ', 'pass ', 'skip', 'todo', 'fail ', 'failed ', 'ok', 'test count' ]

export default function createParser (input, output, options = {}) {
  const { debug, pessimistic, showDiff, tap, verbose } = options

  const _ = createPrinter(output, options)
  const { print: P, prettyMs } = _
  const { diffArray, diffObject, diffString } = createDiffer(_)

  const reader = TapReader({ input, bail: pessimistic })

  const cwd = process.cwd()
  const start = Date.now()

  const counter = { pass: 0, fail: 0, skip: 0, todo: 0 }

  reader.on('comment', ({ comment }) => {
    if (!tapeCommentPrefixes.some((c) => comment.startsWith(c))) {
      // "comment" is generally a test group name
      P(`\n${_.title(comment)}`)
    }
  })

  reader.on('other', ({ line }) => {
    // typically `console.log` output from the test or program it tests
    const stripped = stripAnsi(line).trim()
    const justAnsi = stripped.length === 0 && line.length > 0
    if (!justAnsi) P(_.italic(line), 0)
  })

  reader.on('pass', (test) => {
    counter.pass++
    if (test.skip) counter.skip++
    if (test.todo) counter.todo++

    P(_.pass(test), 2)
  })

  reader.on('fail', (test) => {
    counter.fail++
    if (test.skip) counter.skip++
    if (test.todo) counter.todo++

    P(_.fail(test), 2)

    if (test.diag) {
      const { at, operator, stack } = test.diag
      let { actual, expected } = test.diag
      const indent = 4

      function printBoth (e, a) {
        P(`Actual:   ${JSON.stringify(a)}`, indent)
        P(`Expected: ${JSON.stringify(e)}`, indent)
      }

      if (actual === 'undefined') actual = undefined
      if (expected === 'undefined') expected = undefined

      if (actual && expected && actual === expected) { // shallow test output; can't be diffed
        P(`${_.expected('Expected')} did not match ${_.actual('actual')}.`, indent)
        P(_.dim('TAP output cannot be diffed'), indent)
        P(actual, indent)
      }
      else if (operator === 'equal' || operator === 'deepEqual') {
        // try parsing for JS types
        if (typeof actual === 'string')
          try { actual = parse(actual) }
          catch (_e) { _e }
        if (typeof expected === 'string')
          try { expected = parse(expected) }
          catch (_e) { _e }

        const aType = typeof actual
        const eType = typeof expected
        let sharedType = aType === eType ? `${aType}` : null
        if (sharedType === 'object') {
          if (Array.isArray(actual) && Array.isArray(expected)) sharedType = 'array'
          else if (Array.isArray(actual) && !Array.isArray(expected)) sharedType = null
          else if (!Array.isArray(actual) && Array.isArray(expected)) sharedType = null
        }

        if (sharedType) {
          if ([ 'number', 'bigint', 'boolean', 'symbol', 'function', 'undefined' ].includes(sharedType))
            P(`Expected ${_.expected(expected)} but got ${_.actual(actual)}`, indent)
          else if (showDiff && sharedType === 'array')
            diffArray(actual, expected).forEach(line => P(line, indent))
          else if (showDiff && sharedType === 'object')
            diffObject(actual, expected).forEach(line => P(line, indent))
          else if (showDiff && sharedType === 'string')
            diffString(actual, expected).forEach(line => P(line, indent))
          else
            printBoth(expected, actual)
        }
        else { // mixed types
          printBoth(expected, actual)
        }
      }
      else {
        switch (operator) {
        case 'notEqual':
          P('Expected values to differ', indent)
          break
        case 'notDeepEqual':
          P('Expected values to differ', indent)
          break
        case 'ok':
          P(`Expected ${_.expected('truthy')} but got ${_.actual(actual)}`, indent)
          break
        case 'match':
          P(`Expected "${_.actual(actual)}" to match ${_.expected(expected)}`, indent)
          break
        case 'doesNotMatch':
          P(`Expected "${_.actual(actual)}" to not match ${_.expected(expected)}`, indent)
          break
        case 'throws':
          if (
            actual
              && typeof actual !== 'undefined'
              && expected
              && typeof expected !== 'undefined'
          ) // this weird combination is throws with expected/assertion
            P(`Expected ${_.expected(expected)} to match "${_.actual(actual.message || actual)}"`, indent)
          else if (actual && typeof actual !== 'undefined') // this combination is usually "doesNotThrow"
            P(`Expected to not throw, received "${_.actual(actual)}"`, indent)
          else
            P('Expected to throw', indent)
          break
        case 'error':
          P(`Expected error to be ${_.expected('falsy')}`, indent)
          break
        case 'fail':
          P('Explicit fail', indent)
          break
        default:
          printBoth(expected, actual)
          break
        }
      }

      if (at) P(_.dim(`At: ${at.replace(cwd, '')}`), indent)

      if (stack && verbose)
        stack.split('\n').forEach((s) => {
          P(_.dim(s.trim().replace(cwd, '')), indent)
        })
    }
  })

  reader.on('done', ({ summary, plan, passing, failures, ok }) => {
    if (summary && plan && summary.total < plan.end) {
      P(_.realBad(`\nExpected ${plan.end} tests, parsed ${summary.total}`))
      reader.emit('badCount', { summary, plan })
    }

    if (!ok) {
      if (summary.fail > 0) {
        const singular = summary.fail === 1
        let failureSummary = '\n'
        failureSummary += _.bad('Failed tests:')
        failureSummary += ` There ${singular ? 'was' : 'were'} `
        failureSummary += _.bad(summary.fail)
        failureSummary += ` failure${singular ? '' : 's'}\n`

        P(failureSummary)

        for (const test in failures) P(_.fail(failures[test]), 2)
      }
    }

    P(`\ntotal:     ${summary.total}`)
    // if (result.bailout) P(_.realBad('BAILED!'))
    if (summary.pass > 0) P(_.good(`passing:   ${summary.pass}`))
    if (summary.fail > 0) P(_.bad(`failing:   ${summary.fail}`))
    if (summary.skip > 0) P(_.dim(`skipped:   ${summary.skip}`))
    if (summary.todo > 0) P(_.dim(`todo:      ${summary.todo}`))

    P(`${_.dim.italic(prettyMs(start))}\n`) // maybe output.end()?

    if (debug) {
      P('tap-reader result:')
      P(JSON.stringify({ summary, passing, failures, ok }, null, 2))
      P('tap-arc internal counters:')
      P(JSON.stringify(counter, null, 2))
    }
  })

  if (verbose) {
    reader.on('version', ({ version }) => {
      P(`${_.strong('TAP version:')} ${version}`)
    })
    reader.on('plan', ({ plan, bad }) => {
      const [ start, end ] = plan
      P(`${_.strong('Plan:')} start=${start} end=${end} ${bad ? '(BAD)' : ''}`)
    })
  }

  if (tap) {
    reader.on('line', ({ line }) => {
      P(line.trim())
    })
  }

  return reader
}

#!/usr/bin/env node
import minimist from 'minimist'
import helpText from './_help-text.js'
import tapArc from './tap-arc.js'

const alias = {
  help: [ 'h', 'help' ],
  showDiff: [ 'diff' ],
  pessimistic: [ 'p', 'pessimistic', 'bail' ],
  verbose: [ 'v', 'verbose' ],
  debug: [ 'd', 'debug' ],
  failBadCount: [ 'fail-bad-count' ],
}
const defaultOptions = {
  color: true,
  help: false,
  showDiff: true,
  pessimistic: false,
  failBadCount: false,
  verbose: false,
  debug: false,
}
const options = {
  ...defaultOptions,
  ...minimist(process.argv.slice(2), { alias }),
}

if (options.help) {
  console.log(helpText)
  process.exit()
}

const parser = tapArc(options)
// @ts-ignore - DuplexWrapper is not typed
parser.on('end', () => {
  // @ts-ignore
  const { results } = parser._writable

  if (!results.ok) {
    if (
      results.badCount &&
      results.failures.length === 0 &&
      !options.failBadCount
    ) process.exit(0)
    else process.exit(1)
  }
  if (
    results.count === 0 &&
    results.plan.comment.indexOf('no tests found') >= 0
  ) process.exit(1)
})

// @ts-ignore
process.stdin.pipe(parser).pipe(process.stdout)

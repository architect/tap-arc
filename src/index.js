#!/usr/bin/env node
import minimist from 'minimist'
import helpText from './_help-text.js'
import TapArc from './tap-arc.js'

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
  tap: false,
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

const tapArc = TapArc(process.stdin, process.stdout, options)

let badCount = false
tapArc.on('badCount', () => {
  badCount = true
})

tapArc.on('end', ({ ok }) => {
  if (badCount && options.failBadCount) process.exit(1)
  else process.exit(ok ? 0 : 1)
})

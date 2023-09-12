#!/usr/bin/env node
import minimist from 'minimist'
import helpText from './src/_help-text.js'
import tapArc from './src/tap-arc.js'

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
  ...minimist(process.argv.slice(2), { alias }),
}

if (options.help) {
  console.log(helpText)
  process.exit()
}

const parser = tapArc(options)
// @ts-ignore - DuplexWrapper is not typed
parser.on('end', () => {
  if (!parser._writable.results.ok) process.exit(1)
})

// @ts-ignore
process.stdin.pipe(parser).pipe(process.stdout)

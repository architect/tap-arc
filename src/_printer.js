import { Chalk } from 'chalk'

const RIGHT = '⇥'
const CHECK = '✓'
const CROSS = '✗'
const BOX = '␣'

function prettyMs (start) {
  const ms = Date.now() - start
  return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`
}

export default function (output, options) {
  const { color, debug, verbose } = options
  const d = debug || verbose
  const {
    bgBlue,
    bgYellow,
    blue,
    bold,
    dim,
    green,
    italic,
    red,
    yellow,
  } = new Chalk({ level: color ? 3 : 0 })

  const expected = yellow
  const expectedHighlight = bgYellow.bold
  const actual = blue
  const actualHighlight = bgBlue.bold
  const passMark = bold.green(CHECK)
  const failMark = bold.red(CROSS)
  const skipMark = bold.cyan(RIGHT)
  const todoMark = bold.cyan(BOX)

  function pad (n = 1, c = '  ') {
    return dim(c).repeat(n)
  }

  /**
   * Print a line to the output stream
   * @param {string} str
   * @param {number} p padding
   * @param {number} n newlines
   * @returns void
   */
  function print (str, p = 0, n = 1) {
    output.write(`${pad(p)}${str}${'\n'.repeat(n)}`)
  }

  return {
    pass ({ id, desc, skip, todo, reason }) {
      const mark = skip ? skipMark : todo ? todoMark : passMark
      return `${mark}${reason ? ` - ${reason}` : ''}${d ? ` [${id}]` : ''} ${dim(desc)}`
    },
    fail ({ id, desc, skip, todo, reason }) {
      const mark = skip ? skipMark : todo ? todoMark : failMark
      return `${mark}${reason ? ` - ${reason}` : ''} [${id}] ${red(desc)}`
    },
    print,
    pad,
    prettyMs,
    actual,
    actualHighlight,
    bad: red,
    realBad: bold.underline.red,
    dim,
    expected,
    expectedHighlight,
    good: green,
    italic,
    strong: bold,
    title: bold.underline,
  }
}

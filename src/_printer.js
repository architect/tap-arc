import { Chalk } from 'chalk'

const RIGHT = '↦'
const CHECK = '✓'
const CROSS = '✗'

function prettyMs (start) {
  const ms = Date.now() - start
  return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`
}

export default function (options) {
  const { color, debug, verbose } = options
  const d = debug || verbose
  const {
    blue,
    bold,
    cyan,
    dim,
    green,
    italic,
    magenta,
    red,
    yellow,
  } = new Chalk({ level: color ? 3 : 0 })

  const expected = yellow
  const actual = blue
  const passMark = bold.green(CHECK)
  const failMark = bold.red(CROSS)
  const skipMark = RIGHT

  function pad (n = 1, c = '  ') {
    return dim(c).repeat(n)
  }

  return {
    pass ({ id, name }) {
      return `${passMark}${d ? ` [${id}]` : ''} ${dim(name)}`
    },
    fail ({ id, name, tapError }) {
      return `${failMark} ${tapError ? red(`"${tapError}"`) : `[${id}] ${red(name)}`}`
    },
    skip ({ id, name }) {
      return cyan(`${skipMark}${d ? ` [${id}]` : ''} ${name}`)
    },
    todo ({ id, name, ok: pass }) {
      const method = pass ? dim : red
      return method(`${skipMark}${d ? ` [${id}]` : ''} ${name}`)
    },
    diffOptions: { actual, expected, dim: italic.dim },
    pad,
    prettyMs,
    actual,
    bad: red,
    realBad: bold.underline.red,
    dim,
    expected,
    good: green,
    highlight: magenta,
    strong: bold,
    title: bold.underline,
  }
}

import { Chalk } from 'chalk'

const RIGHT = '▸'
const CHECK = '✓'
const CROSS = '✗'

function prettyMs (start) {
  const ms = Date.now() - start
  return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`
}

export default function (options, output) {
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

  const good = green
  const bad = red
  const expected = yellow
  const actual = blue
  const passMark = bold.green(CHECK)
  const failMark = bold.red(CROSS)
  const skipMark = RIGHT

  function pad (n = 1, c = '  ') {
    return dim(c).repeat(n)
  }

  return {
    end (start) {
      output.end(`${dim(prettyMs(start))}\n`)
    },
    print (str, p = 0) {
      output.write(`${pad(p)}${str}\n`)
    },
    pass (test) {
      const { id, name } = test
      return `${passMark}${d ? ` [${bold.dim(id)}]` : ''} ${dim(name)}`
    },
    fail (test) {
      const { id, name, tapError } = test
      return tapError
        ? `${failMark} ${red(tapError)}`
        : `${failMark} [${bold.dim(id)}] ${red(name)}`
    },
    skip (test) {
      const { id, name } = test
      return cyan(`${skipMark}${d ? ` [${bold.dim(id)}]` : ''} ${name}`)
    },
    todo (test) {
      const { id, name, ok: pass } = test
      const method = pass ? dim : red
      return method(`${skipMark}${d ? ` [${bold.dim(id)}]` : ''} ${name}`)
    },
    diffOptions: { actual, expected, dim: italic.dim },
    pad,
    actual,
    bad,
    bail: bold.underline.red,
    dim,
    expected,
    good,
    highlight: magenta,
    strong: bold,
    title: bold.underline,
  }
}

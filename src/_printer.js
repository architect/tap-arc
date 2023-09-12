import { Chalk } from 'chalk'

const RIGHT = '▸'
const CHECK = '✓'
const CROSS = '✗'

function prettyMs (start) {
  const ms = Date.now() - start
  return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`
}

export default function (options, output) {
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
  } = new Chalk({ level: options.color ? 3 : 0 })

  const good = green
  const bad = red
  const expected = yellow
  const actual = blue
  const passMark = bold.green(CHECK)
  const failMark = bold.red(CROSS)
  const skipMark = RIGHT
  const pad = (n = 1, c = '  ') => dim(c).repeat(n)

  return {
    end (start) {
      output.end(`${dim(prettyMs(start))}\n`)
    },
    print (s, p = 0) {
      output.write(`${pad(p)}${s}\n`)
    },
    pass (s) {
      return `${passMark} ${dim(s)}`
    },
    fail (s, id) {
      return `${failMark} ${id}) ${red(s)}`
    },
    skip (s) {
      return cyan(`${skipMark} ${s}`)
    },
    todo (s, pass = true) {
      const method = pass ? dim : red
      return method(`${skipMark} ${s}`)
    },
    diffOptions: { actual, expected, dim: italic.dim },
    pad,
    good,
    bad,
    dim,
    bail: bold.underline.red,
    highlight: magenta,
    title: bold.underline,
    expected,
    actual,
  }
}

import * as Diff from 'diff'

/**
 * Create a function to create a diff as a set of strings
 * @param {object} params printer
 * @param {function} params.actual
 * @param {function} params.expected
 * @param {function} params.dim
 * @returns function
 */
export default function ({ actual, expected, expectedHighlight, actualHighlight }) {
  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffLine (a, e) {
    const diff = Diff.diffWordsWithSpace(a, e)

    let aLine = 'Actual:   '
    let eLine = 'Expected: '

    for (const d of diff) {
      if (d.added) eLine += expected(d.value)
      else if (d.removed) aLine += actual(d.value)
      else {
        eLine += d.value
        aLine += d.value
      }
    }

    return [ aLine, eLine ]
  }

  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffMultiLine (a, e) {
    const diff = Diff.diffLines(a, e)
    const output = []

    for (const d of diff) {
      if (d.added) output.push(`${expected(d.value)}`)
      else if (d.removed) output.push(`${actual(d.value)}`)
      else output.push(d.value)
    }

    return output.join('').split('\n')
  }

  /**
   * @param {any[]} a actual
   * @param {any[]} e expected
   * @returns {string[]} output lines
   */
  function diffArray (a, e) {
    const output = []
    const diff = Diff.diffArrays(a, e)

    for (const d of diff) {
      if (d.added) d.value.forEach(v => output.push(`  ${expected(JSON.stringify(v))},`))
      else if (d.removed) d.value.forEach(v => output.push(`  ${actual(JSON.stringify(v))},`))
      else d.value.forEach(v => output.push(`  ${JSON.stringify(v)},`))
    }

    output.unshift('Array [')
    output.push(']')

    return output
  }

  /**
   * @param {object} a actual
   * @param {object} e expected
   * @returns {string[]} output lines
   */
  function diffObject (a, e) {
    const output = []
    const diff = Diff.diffJson(a, e)

    for (let i = 0, len = diff.length; i < len; i++) {
      const a = diff[i]
      const b = diff[i + 1]
      // Diff line if a remove is followed by an add (it's like a 'replace' operation)
      if (b && a.removed && b.added && a.count === b.count) {
        const linesA = a.value.split('\n')
        const linesB = b.value.split('\n')
        if (linesA.length === linesB.length) {
          linesA.forEach((lineA, j) => {
            const lineB = linesB[j]
            if (j === linesA.length - 1) return
            const diff = Diff.diffChars(lineA + '\n', lineB + '\n')

            let aLine = ''
            let eLine = ''

            for (const d of diff) {
              if (d.added) eLine += expectedHighlight(d.value)
              else if (d.removed) aLine += actualHighlight(d.value)
              else {
                eLine += expected(d.value)
                aLine += actual(d.value)
              }
            }
            output.push(aLine, eLine)
          })
          i++
          continue
        }
      }
      if (a.added) output.push(`${expected(a.value)}`)
      else if (a.removed) output.push(`${actual(a.value)}`)
      else output.push(a.value)
    }

    output[0] = `Object ${output[0]}`

    return output.join('').split('\n')
  }

  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffString (a, e) {
    const aLines = a.split('\n')
    const eLines = e.split('\n')
    if (aLines.length > 1 || eLines.length > 1) return diffMultiLine(a, e)
    else return diffLine(a, e)
  }

  return { diffArray, diffLine, diffObject, diffString }
}

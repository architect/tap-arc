import * as Diff from 'diff'

/**
 * Create a function to create a diff as a set of strings
 * @param {object} params printer
 * @param {function} params.actual
 * @param {function} params.expected
 * @param {function} params.dim
 * @returns function
 */
export default function ({ actual, expected }){
  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffLine (a, e) {
    const diff = Diff.diffWordsWithSpace(a, e)
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
      if (d.added) d.value.forEach(v => output.push(`  ${expected(v)}`))
      else if (d.removed) d.value.forEach(v => output.push(`  ${actual(v)}`))
      else d.value.forEach(v => output.push(`  ${v}`))
    }

    output.unshift('[')
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

    for (const d of diff) {
      if (d.added) output.push(`${expected(d.value)}`)
      else if (d.removed) output.push(`${actual(d.value)}`)
      else output.push(d.value)
    }

    return output.join('').split('\n')
  }

  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffString (a, e) {
    // TODO: determine how to diff long lines
    return diffLine(a, e)
  }

  return { diffArray, diffLine, diffObject, diffString }
}

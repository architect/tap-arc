import * as Diff from 'diff'
import JSON5 from 'json5'
const { parse } = JSON5

/**
 * Create a function to create a diff as a set of strings
 * @param {object} params printer
 * @param {function} params.actual
 * @param {function} params.expected
 * @param {function} params.dim
 * @returns function
 */
export default function ({ actual, expected, dim }){
  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffLine (a, e) {
    const diff = Diff.diffWordsWithSpace(a, e)
    const output = []

    for (const d of diff) {
      if (d.added) {
        output.push(`${expected(d.value)}`)
      }
      else if (d.removed) {
        output.push(`${actual(d.value)}`)
      }
      else {
        output.push(d.value)
      }
    }

    return output.join('').split('\n')
  }

  /**
   * @param {any[]} a actual
   * @param {any[]} e expected
   * @returns {string[]} output lines
   */
  function diffArray (a, e) {
    // we already know they are arrays
    const output = []
    const diff = Diff.diffArrays(a, e)

    for (const d of diff) {
      if (d.added) {
        d.value.forEach(v => output.push(`  ${expected(v)}`))
      }
      else if (d.removed) {
        d.value.forEach(v => output.push(`  ${actual(v)}`))
      }
      else {
        d.value.forEach(v => output.push(`  ${v}`))
      }
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
    // we already know they are objects
    const output = []
    const diff = Diff.diffJson(a, e)

    for (const d of diff) {
      if (d.added) {
        output.push(`${expected(d.value)}`)
      }
      else if (d.removed) {
        output.push(`${actual(d.value)}`)
      }
      else {
        output.push(d.value)
      }
    }

    return output.join('').split('\n')
  }

  /**
   * @param {string} a actual
   * @param {string} e expected
   * @returns {string[]} output lines
   */
  function diffUnknown (a, e) {
    if (typeof a !== 'string' || typeof e !== 'string')
      throw new Error('diff: expected strings')

    // try parsing for JS types
    let parsedA
    try { parsedA = parse(a) }
    catch (_e) { parsedA = null }

    let parsedE
    try { parsedE = parse(e) }
    catch (_e) { parsedE = null }

    if (parsedA) a = parsedA
    if (parsedE) e = parsedE
    const bothParsed = parsedA && parsedE

    const aType = typeof a
    const eType = typeof e
    const sharedType = aType === eType ? aType : null
    const output = []

    // console.log({ a, e, aType, eType, sharedType, bothParsed })

    if (sharedType) {
      if (bothParsed) {
        if (sharedType === 'string') {
          // a and e can be multi-line strings
          console.trace('striiiiiiiiiiiiiiiings')
        }
        else if (sharedType === 'object') {
          return diffObject(a, e)
        }
        else {
          console.trace('WTF', sharedType)
        }
      }
      else {
        if (a === e) { // shallow test output; can't be diffed
          output.push([
            `${expected('Expected')} did not match ${actual('actual')}.`,
            dim('Test output cannot be diffed.'),
          ].join(' '))
        }
        else {
          return diffLine(a, e)
        }
      }
    }
    else {
      // skip the diff and just show the values
      output.push(`Expect: ${expected(eType === 'string' ? e : JSON.stringify(e))}`)
      output.push(`Actual: ${actual(aType === 'string' ? a : JSON.stringify(a))}`)
    }

    return output
  }

  return { diffArray, diffLine, diffObject, diffUnknown }
}

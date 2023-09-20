// eslint-disable-next-line import/no-unresolved
import { strict } from 'tcompare' // what's going on with @tapjs packages?
import JSON5 from 'json5'

/**
 * Create a function to create a diff as a set of strings
 * @param {object} params
 * @param {function} params.actual
 * @param {function} params.expected
 * @param {function} params.dim
 * @returns function
 */
export default function createMakeDiff ({ actual, expected, dim }){
  /**
   * Create a diff as a set of strings
   * @param {string} a
   * @param {string} e
   * @returns [string]
   */
  return function (a, e) {
    const msg = []
    let isJson = true
    let actualJson = a
    let expectedJson = e

    try {
      actualJson = JSON5.parse(a)
      expectedJson = JSON5.parse(e)
    }
    catch (e) {
      isJson = false
    }

    if (isJson) {
      a = actualJson
      e = expectedJson
    }

    const compared = strict(a, e, {
      includeEnumerable: true,
      includeGetters: true,
      sort: true,
    })

    if (compared.match) {
      msg.push(`${expected('Expected')} did not match ${actual('actual')}.`)
    }
    else {
      // remove leading header lines
      let diff = compared.diff.split('\n')
      diff = diff.slice(2, diff.length - 1)

      for (const line of diff) {
        switch (line.charAt(0)) {
        case '-': {
          msg.push(expected(line))
          break
        }
        case '+': {
          msg.push(actual(line))
          break
        }
        case '@': {
          msg.push(dim(line))
          break
        }
        default:{
          msg.push(line)
          break
        }
        }
      }
    }

    return msg
  }
}

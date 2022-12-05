import { strict } from 'tcompare'
import JSON5 from 'json5'

/**
 * Create a function to create a diff as a set of strings
 * @param {object} params
 * @param {function} params.green
 * @param {function} params.red
 * @param {function} params.dim
 * @returns function
 */
export default function createMakeDiff ({ green, red, dim }){
  /**
   * Create a diff as a set of strings
   * @param {string} actual
   * @param {string} expected
   * @returns [string]
   */
  return function (actual, expected) {
    const msg = []
    let isJson = true
    let actualJson = actual
    let expectedJson = expected

    try {
      actualJson = JSON5.parse(actual)
      expectedJson = JSON5.parse(expected)
    }
    catch (e) {
      isJson = false
    }

    if (isJson) {
      actual = actualJson
      expected = expectedJson
    }

    const compared = strict(actual, expected, {
      includeEnumerable: true,
      includeGetters: true,
      sort: true,
    })

    if (compared.match) {
      msg.push(`${red('Expected')} did not match ${green('actual')}.`)
    }
    else {
      // remove leading header lines
      let diff = compared.diff.split('\n')
      diff = diff.slice(2, diff.length - 1)

      for (const line of diff) {
        switch (line.charAt(0)) {
        case '-': {
          msg.push(red(line))
          break
        }
        case '+': {
          msg.push(green(line))
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

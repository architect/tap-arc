export default `
Usage:
  tap-arc <options>

Parses TAP data from stdin, and outputs a "spec-like" formatted result.

Options:

  -v | --verbose
    Output full stack trace, TAP version, and plan

  -p | --pessimistic | --bail
    Immediately exit upon encountering a failure
    example: tap-arc -p

  --no-diff
    Do not show diff for failed assertions
    example: tap-arc --no-diff

  --no-color
    Output without ANSI escape sequences for colors
    example: tap-arc --no-color

  --fail-bad-count
    Fail when the number of assertions parsed does not match the plan
    example: tap-arc --fail-bad-count`

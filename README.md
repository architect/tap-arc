# `tap-arc`

> A small (~25kB) [TAP](https://testanything.org/) reporter with spec-like output, streaming, and failure diffing.

## Objectives

- minimal, informative spec-like output for all assertions
- minimal, maintained dependencies
- streaming in and out
- helpful diffing for failures

![tap-arc output screen shot](./screen-shot.png)

## Installation & Usage

> Compatible with Node.js 14+.

Save `tap-arc` as a development dependency:

```sh
npm i -D tap-arc
```

Simply pipe tap output to `tap-arc`.  
Example `npm test` script:

```js
// package.json
"scripts": {
  "test": "tape test/**/*.js | tap-arc"
}
```

> 💁  `tap-arc` will format output from any tap reporter. [`tape`](https://github.com/substack/tape) was used for testing.

Alternatively, use `tap-arc` globally:

```sh
npm i -g tap-arc
```

### `tap-arc --help`

```
Usage:
  tap-arc <options>

Parses TAP data from stdin, and outputs a "spec-like" formatted result.

Options:

  -v | --verbose
    Output full stack trace

  -p | --pessimistic | --bail
    Immediately exit upon encountering a failure
    example: tap-arc -p

  --no-color
    Output without ANSI escape sequences for colors
    example: tap-arc --no-color
```

## Development

When building `tap-arc`, it's helpful to try various TAP outputs. See `package.json` `"scripts"` for useful "tap-arc:*" commands to test passing and failing TAP.

```sh
npm run tap-arc:simple # used to create the screen shot above
```

### Tests

`tap-arc` is tested to output the correct exit code based on your test suite's TAP output. In the process, the boundaries of tap-arc's process are also tested by creating and parsing several types of TAP output.

Snapshot testing became too arduous to maintain for the sake of aesthetics.

Testing could be improved by unit testing the printer and diff maker.

## Credit & Inspiration

- [tap-spec](https://github.com/scottcorgan/tap-spec) ol' reliable, but a bit stale and npm vulnerabilities
- [tap-difflet](https://github.com/namuol/tap-difflet) inspired output and diffing, also vulnerable
- [tap-min](https://github.com/derhuerst/tap-min) helpful approaches to streaming and exit codes

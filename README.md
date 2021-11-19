> ⚠️  In transition from "tap-spek" to "tap-arc"

# `tap-arc`

> A small (~12kB) [TAP](https://testanything.org/) reporter with spec-like output, streaming, and failure diffing.

## Objectives

- minimal, informative spec-like output for all assertions
- minimal, maintained dependencies -- can't be shipping React to CI
- streaming in and out
- helpful diffing for failures

![tap-arc output screen shot](./screen-shot.png)

## Installation & Usage

> Requires Node.js 14+

For a JavaScript project, save `tap-arc` as a development dependency:

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

```sh
Usage:
  tap-arc <options>

Parses TAP data from stdin, and outputs a "spec-like" formatted result.

Options:

	-v | --verbose
		Output full stack trace

	-p | --pessimistic | --bail
		Immediately exit upon encountering a failure
		example: tap-arc -p

	--padding [space, dot, <custom characters>]
		String to use when padding output (default="  ")
		example: tap-arc --padding "••"
		example: tap-arc --padding dot

	--indent [space, dot, <custom characters>]
		String to use when indenting Object diffs (default="··")
		example: tap-arc --indent ">>"
		example: tap-arc --indent space
```

## Development

The bulk of the lib lives in `./index.js`.  
`./bin/tap-arc` pipes stdin (from a TAP reporter) to `tap-arc` and then to stdout. The bin also handles exit code for a failing run.

When building `tap-arc`, it's helpful to try various TAP outputs. See `package.json` `"scripts"` for useful "spek:*" commands to test passing and failing TAP.

```sh
npm run spek:simple # used to create the screen shot above
```

The main library is snapshot tested (`npm test` loads all snapshots to compare to current output). Create snapshots with the `npm run make-snapshots` commands.

## Credit & Inspiration

- [tap-spec](https://github.com/scottcorgan/tap-spec) ol' reliable, but a bit stale and npm vulnerabilities
- [tap-difflet](https://github.com/namuol/tap-difflet) inspired output and diffing, also vulnerable
- [tap-min](https://github.com/derhuerst/tap-min) helpful approaches to streaming and exit codes
- [ansi-regex](https://github.com/chalk/ansi-regex) copied regex pattern for ansi

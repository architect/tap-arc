# `tap-spek`

> A small (<10kB) [TAP](https://testanything.org/) reporter with spec-like output, streaming, and failure diffing.

## Objectives

- minimal, informative spec-like output for all assertions
- minimal, maintained dependencies -- can't be shipping React to CI
- streaming in and out
- helpful diffing for failures

![tap-spek output screen shot](./screen-shot.png)

## Installation & Usage

For a JavaScript project, save `tap-spek` as a development dependency:

```sh
npm i -D tap-spek
```

Example `npm test` script:

```js
// package.json
"scripts": {
  "test": "tape test/**/*.js | tap-spek"
}
```

> ℹ️  `tap-spek` will format output from any tap reporter. [`tape`](https://github.com/substack/tape) was used for testing.

## TODO & Improvements

- [x] TAP kitchen sink (specialized output for each operator)
- [ ] group failure summary by comment (currently just a list of names)
- [ ] improve nested test output (indented sub-tests)
- [ ] test tap-spek with snapshot tests
- [ ] combined support for ESM and CommonJS
- [ ] remove `duplexer3` dep
- [ ] options
  - [ ] print stacktrace
  - [ ] no colors
  - [ ] pessimistic
  - others?

## Credit & Inspiration

- [tap-spec](https://github.com/scottcorgan/tap-spec) ol' reliable, but a bit stale and npm vulnerabilities
- [tap-difflet](https://github.com/namuol/tap-difflet) inspired output and diffing, also vulnerable
- [tap-min](https://github.com/derhuerst/tap-min) helpful approaches to streaming and exit codes

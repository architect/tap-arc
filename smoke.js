import { Parser } from 'tap-parser'
const parser = new Parser(results => console.dir(results))
process.stdin.pipe(parser)

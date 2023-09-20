// ℹ️ Smoke test CLI program with bare minimum Parser

// eslint-disable-next-line import/no-unresolved
import { Parser } from 'tap-parser'
const p = new Parser(console.log)
process.stdin.pipe(p)

// ℹ️ Smoke test CLI program with bare minimum Parser
import { Parser } from 'tap-parser'
const p = new Parser(console.log)
process.stdin.pipe(p)

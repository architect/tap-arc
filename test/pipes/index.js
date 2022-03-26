const Minipass = require('minipass')
// const Parser = require('tap-parser')

function delay (ms) {
  return new Promise(res => setTimeout(res, ms))
}

const stream = new Minipass()

process.stdin.pipe(stream)
// parser.pipe(stream)
stream.pipe(process.stdout)

async function main () {
  stream.write('foo\n')
  stream.write('wait 2 sec\n')
  await delay(2000)
  stream.write('bar\n')
  stream.end('done.\n')
}

main()

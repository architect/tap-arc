const test = require('tape')

function sleep (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

test('Immediate assertions', function (t) {
  t.pass('The first one')
  t.pass('Number 2')
  t.end()
})

test('Some sleepy tests', async function (t) {
  t.pass('|‾| 3 immediate passing')
  t.pass('| |')
  t.pass('|_| This shape should print immediately!')

  await sleep(2000)

  t.pass('[-] 2s has passed. Sleeping 4s')

  await sleep(4000)

  t.pass('[-] Slept 4s. Going to next group...')
  t.end()
})

test('Some more sleepy tests', async function (t) {
  t.pass('|‾| 2 immediate passing')
  t.pass('|_| This shape should print immediately!')

  await sleep(2000)

  t.pass('[-] 2s has passed. Sleeping 4s')

  await sleep(4000)

  t.pass('[-] Slept 4s. All done.')
  t.end()
})

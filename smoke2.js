const chunks = []

process.stdin.on('readable', () => {
  let c
  // eslint-disable-next-line no-cond-assign
  while (null !== (c = process.stdin.read())) chunks.push(c)
})

process.stdin.on('end', () => {
  const content = chunks.join('')
  console.log("content.indexOf('ok 1 ')", content.indexOf('ok 1 '))     // > 0
  console.log("content.indexOf('ok 9 ')", content.indexOf('ok 9 '))     // -1
  console.log("content.indexOf('ok 27 ')", content.indexOf('ok 27 '))   // -1
  console.log("content.indexOf('ok 148 ')", content.indexOf('ok 148 ')) // > 0
})

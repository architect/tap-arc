import fs from 'fs'

const writable = fs.createWriteStream('file.txt')
process.stdin.pipe(writable)

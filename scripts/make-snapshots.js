const { exec } = require('child_process')
const { scripts } = require('../package.json')

const NODE_MAJOR_VERSION = process.versions.node.split('.')[0]

const commands = Object.keys(scripts).filter((key) => key.indexOf('tap-arc:') === 0)

for (const command of commands) {
  const [ name, args = '' ] = command.split(':').slice(1)

  exec(
    `npm run --silent ${command} > test/snapshots/node${NODE_MAJOR_VERSION}/${name}${args}.txt`,
    (_error, _stdout, stderr) => {
      if (stderr) console.log(`Unexpected stderror: ${stderr}`)
      console.log(`Snapped ${name} ${args} with ${command}`)
    }
  )
}

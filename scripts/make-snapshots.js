const { exec } = require('child_process')
const { scripts } = require('../package.json')
const fs = require('fs')

const NODE_MAJOR_VERSION = process.versions.node.split('.')[0]
const snapshotFolder = `test/snapshots/node${NODE_MAJOR_VERSION}`
const commands = Object.keys(scripts).filter((key) => key.indexOf('tap-arc:') === 0)

async function main () {
  try {
    await fs.mkdirSync(snapshotFolder)
  }
  catch (error) {
    if (error.code === 'EEXIST')
      console.error('Manually delete existing snapshots first')
    else
      throw error
    process.exit(1)
  }

  for (const command of commands) {
    const [ name, args = '' ] = command.split(':').slice(1)

    exec(
      `npm run --silent ${command} > ${snapshotFolder}/${name}${args}.txt`,
      () => {
        console.log(`Snapped "${command}" to ${snapshotFolder}/${name}${args}.txt`)
      }
    )
  }
}

main()

const { exec } = require('child_process')
const { scripts } = require('../package.json')
const fs = require('fs')

const NODE_MAJOR_VERSION = process.versions.node.split('.')[0]
const producers = ['native, tape']
const commands = Object.keys(scripts).filter((key) => key.indexOf('tap-arc:') === 0)

async function main () {
  for (const producer of producers) {
    const snapshotFolder = `test/snapshots/${producer}/node${NODE_MAJOR_VERSION}`

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
  }

  for (const command of commands) {
    const [ _, args = '' ] = command.split(':').slice(1)
    const [ producer, name ] = _.split('-')
    const fileName = `test/snapshots/${producer}/node${NODE_MAJOR_VERSION}/${name}${args}.txt`

    exec(
      `npm run --silent ${command} > ${fileName}`,
      () => {
        console.log(`Snapped "${command}" to ${fileName}`)
      }
    )
  }
}

main()

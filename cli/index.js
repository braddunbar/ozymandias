'use strict'

const commands = {
  browserify: require('./browserify'),
  dump: require('./dump'),
  manifest: require('./manifest'),
  migrate: require('./migrate'),
  migration: require('./migration'),
  reset: require('./reset'),
  rollup: require('./rollup'),
  server: require('./server'),
  sass: require('./sass')
}

module.exports = async function () {
  try {
    const [, , command, ...args] = process.argv

    if (!commands[command]) throw new Error(`unknown command: ${command}`)

    await commands[command].call(this, ...args)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

'use strict'

const util = require('util')
const resolve = require('resolve')
const {rollup} = require('rollup')
const buble = require('rollup-plugin-buble')
const {digestPath} = require('./assets')
const {STATIC_ORIGIN} = process.env

// Insert assets into rollup bundle directly.
const assets = {

  name: 'assets',

  async load (id) {
    if (!id.startsWith('asset-path:')) return null
    const url = await digestPath(id.slice(11))
    return `export default ${util.inspect((STATIC_ORIGIN || '') + '/' + url)}`
  },

  resolveId (importee, importer) {
    if (importee.startsWith('asset-path:')) return importee
    if (importee.startsWith('ozymandias/')) {
      return resolve.sync(importee, {basedir: process.cwd()})
    }
  }

}

// Insert environment variables into scripts.
const env = {
  name: 'env',

  load (id) {
    if (!id.startsWith('env:')) return null
    const value = process.env[id.slice(4)]
    return `export default ${util.inspect(value)}`
  },

  resolveId (importee, importer) {
    if (importee.startsWith('env:')) return importee
  }

}

module.exports = async (file) => {
  const bundle = await rollup({
    entry: file,
    onwarn: () => {},
    plugins: [buble({objectAssign: "require('object-assign')"}), assets, env]
  })
  const {code} = await bundle.generate({format: 'cjs'})
  return code
}

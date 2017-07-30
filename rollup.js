'use strict'

const path = require('path')
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
    const file = path.relative(process.cwd(), id)
    if (!/^public\//.test(file)) return null
    const url = await digestPath(path.relative('public', file))
    return `export default ${util.inspect((STATIC_ORIGIN || '') + '/' + url)}`
  },

  resolveId (importee, importer) {
    if (/^public\//.test(importee)) {
      return path.resolve(importee)
    }

    if (/^ozymandias\//.test(importee)) {
      return resolve.sync(importee, {basedir: process.cwd()})
    }
  }

}

// Insert environment variables into scripts.
const env = {
  name: 'env',

  load (id) {
    const file = path.relative(process.cwd(), id)
    if (!/^env\//.test(file)) return null
    const value = process.env[file.slice(4)]
    return `export default ${util.inspect(value)}`
  },

  resolveId (importee, importer) {
    if (/^env\//.test(importee)) {
      return path.resolve(importee)
    }
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

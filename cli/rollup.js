'use strict'

const path = require('path')
const util = require('util')
const resolve = require('resolve')
const {rollup} = require('rollup')
const buble = require('rollup-plugin-buble')
const {digestPath} = require('../assets')
const {STATIC_ORIGIN} = process.env

// Insert assets into rollup bundle directly.
const assets = {

  name: 'assets',

  load (id) {
    const file = path.relative(process.cwd(), id)
    if (!/^public\//.test(file)) return null
    const url = digestPath(path.relative('public', file))
    const code = `export default ${util.inspect((STATIC_ORIGIN || '') + '/' + url)}`

    const ast = {
      body: [],
      end: null,
      sourceType: 'module',
      start: 0,
      type: 'Program'
    }

    return {ast, code, map: {mappings: ''}}
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
    const code = `export default ${util.inspect(value)}`

    const ast = {
      body: [],
      end: null,
      sourceType: 'module',
      start: 0,
      type: 'Program'
    }

    return {ast, code, map: {mappings: ''}}
  },

  resolveId (importee, importer) {
    if (/^env\//.test(importee)) {
      return path.resolve(importee)
    }
  }

}

module.exports = async function (entry) {
  try {
    const code = await rollup({
      entry,
      onwarn: () => {},
      plugins: [buble({objectAssign: "require('object-assign')"}), assets, env]
    })
    console.log(code.generate({format: 'cjs'}).code)
  } catch (error) {
    console.error(error.stack)
  }
}

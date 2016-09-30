'use strict'

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const rollup = require('rollup').rollup
const buble = require('rollup-plugin-buble')

// Insert assets into rollup bundle directly.
const assets = {

  name: 'assets',

  load (id) {
    let file = path.relative(process.cwd(), id)

    // Bail unless this is a public file.
    if (!/^public\//.test(file)) return null

    const buffer = fs.readFileSync(file)
    const hash = crypto.createHash('md5').update(buffer).digest('hex')
    const dir = path.relative('public', path.dirname(file))
    const ext = path.extname(file)
    const base = path.basename(file, ext)
    const code = `export default "/assets/${dir}/${base}-${hash + ext}"`

    const ast = {
      body: [],
      end: null,
      sourceType: 'module',
      start: 0,
      type: 'Program'
    }

    return {ast, code, map: {mappings: ''}}
  }

}

// Roll it up!
module.exports = (file) => (
  rollup({
    entry: file,
    onwarn: () => {},
    plugins: [buble({objectAssign: "require('object-assign')"}), assets]
  }).then((code) => (
    code.generate({format: 'cjs'}).code
  )).catch((error) => {
    console.error(error.stack)
  })
)

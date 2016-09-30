'use strict'

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const sass = require('node-sass')

module.exports = (file) => (
  sass.renderSync({
    file,
    outputStyle: 'compressed',
    functions: {
      'asset-path($file)': (file) => {
        file = file.getValue()

        const dir = path.dirname(file)
        const ext = path.extname(file)
        const base = path.basename(file, ext)
        const buffer = fs.readFileSync(path.join('public', file))
        const hash = crypto.createHash('md5').update(buffer).digest('hex')
        const url = path.join('/assets', dir, `${base}-${hash + ext}`)

        return new sass.types.String(`url('${url}')`)
      }
    }
  }).css.toString()
)

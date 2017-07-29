'use strict'

const sass = require('node-sass')
const {digestPath} = require('../assets')
const {STATIC_ORIGIN} = process.env

module.exports = async function (file) {
  const output = sass.renderSync({
    file,
    outputStyle: 'compressed',
    functions: {
      'asset-path($file)': (file) => {
        const url = digestPath(file.getValue())
        return new sass.types.String(`url('${STATIC_ORIGIN || ''}/${url}')`)
      }
    }
  }).css.toString()

  console.log(output)
}

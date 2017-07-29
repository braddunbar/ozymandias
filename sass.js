'use strict'

const sass = require('node-sass')
const {promisify} = require('util')
const {digestPath} = require('./assets')
const {STATIC_ORIGIN} = process.env
const render = promisify(sass.render)

const functions = {
  'asset-path($file)' (file, done) {
    digestPath(file.getValue()).then((url) => {
      done(new sass.types.String(`url('${STATIC_ORIGIN || ''}/${url}')`))
    })
  }
}

module.exports = async (file) => {
  const {css} = await render({file, functions, outputStyle: 'compressed'})
  return css.toString()
}

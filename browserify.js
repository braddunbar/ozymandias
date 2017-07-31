'use strict'

const {minify} = require('uglify-js')
const browserify = require('browserify')
const {Readable} = require('stream')

module.exports = async (script) => {
  const stream = new Readable()
  stream.push(script)
  stream.push(null)
  const output = await new Promise((resolve, reject) => {
    browserify(stream).bundle((error, buffer) => (
      error ? reject(error) : resolve(buffer.toString())
    ))
  })
  if (process.env.NODE_ENV !== 'production') return output
  const {code, error} = minify(output)
  if (error) throw error
  return code
}

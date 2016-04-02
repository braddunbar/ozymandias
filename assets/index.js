'use strict'

const crypto = require('crypto')

if (process.env.NODE_ENV === 'production') {
  const assets = require('./fingerprints.json')
  exports.path = (path) => assets[path] || `/${path}`
  exports.version = crypto
    .createHash('md5')
    .update(JSON.stringify(assets))
    .digest('hex')
} else {
  exports.path = (path) => `/${path}`
  exports.version = '☃'
}

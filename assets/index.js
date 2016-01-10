'use strict'

if (process.env.NODE_ENV === 'production') {
  const assets = require('./fingerprints.json')
  exports.path = (path) => assets[path] || `/${path}`
} else {
  exports.path = (path) => `/${path}`
}

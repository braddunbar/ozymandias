'use strict'

const assets = require('./fingerprints.json')

exports.path = function (path) {
  return assets[path] || ('/' + path)
}

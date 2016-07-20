'use strict'

// Must be ES5 for the client!
var assets = require('./fingerprints.json')

exports.path = function (path) {
  return assets[path] || ('/' + path)
}

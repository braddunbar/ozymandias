'use strict'

const assets = require('./fingerprints.json')
exports.path = (path) => assets[path] || `/${path}`

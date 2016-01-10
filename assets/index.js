'use strict'

const fs = require('fs')

let assets = null

try {
  assets = JSON.parse(fs.readFileSync('./assets.json').toString())
} catch (e) {}

exports.path = (path) => assets && assets[path] || `/${path}`

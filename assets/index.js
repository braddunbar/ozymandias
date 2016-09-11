'use strict'

let assets = {}
const fs = require('fs')

try {
  assets = JSON.parse(fs.readFileSync('public/assets/.manifest.json'))
} catch (e) { }

exports.path = (path) => `/${assets[path] || path}`

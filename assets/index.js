'use strict'

let assets = {}
const fs = require('fs')

try {
  assets = JSON.parse(fs.readFileSync('public/assets/.manifest.json')).assets
} catch (error) { }

exports.path = (path) => `/${assets[path] || path}`

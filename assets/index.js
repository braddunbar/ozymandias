'use strict'

let assets = {}
const fs = require('fs')
const crypto = require('crypto')

try {
  assets = JSON.parse(fs.readFileSync('public/assets/.manifest.json')).assets
} catch (error) { }

exports.path = (path) => `/${assets[path] || path}`

exports.version = crypto
  .createHash('md5')
  .update(JSON.stringify(assets))
  .digest('hex')

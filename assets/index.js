'use strict'

let assets = {}
const fs = require('fs')
const crypto = require('crypto')
const {STATIC_ORIGIN} = process.env

try {
  assets = JSON.parse(fs.readFileSync('public/assets/.manifest.json')).assets
} catch (error) { }

exports.path = (path) => `${STATIC_ORIGIN || ''}/${assets[path] || path}`

exports.version = crypto
  .createHash('md5')
  .update(JSON.stringify(assets))
  .digest('hex')

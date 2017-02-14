'use strict'

const fs = require('fs')
const crypto = require('crypto')
const {STATIC_ORIGIN} = process.env

let assets = {}
let integrity = {}

try {
  const manifest = JSON.parse(fs.readFileSync('public/assets/.manifest.json'))
  assets = manifest.assets
  integrity = manifest.integrity
} catch (error) { }

exports.path = (path) => `${STATIC_ORIGIN || ''}/${assets[path] || path}`

exports.integrity = (path) => integrity[path] || ''

exports.version = crypto
  .createHash('sha256')
  .update(JSON.stringify(assets))
  .digest('hex')

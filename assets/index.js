'use strict'

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const {STATIC_ORIGIN} = process.env

let assets = {}
let integrity = {}

try {
  const manifest = JSON.parse(fs.readFileSync('public/assets/.manifest.json'))
  assets = manifest.assets
  integrity = manifest.integrity
} catch (error) { }

exports.path = (asset) => path.join(STATIC_ORIGIN || '/', assets[asset] || asset)

exports.integrity = (path) => integrity[path] || ''

exports.version = crypto
  .createHash('sha256')
  .update(JSON.stringify(assets))
  .digest('hex')

exports.digestPath = (asset) => {
  const {dir, name, ext} = path.parse(asset)
  const buffer = fs.readFileSync(path.join('public', asset))
  const digest = crypto.createHash('sha256').update(buffer).digest('hex')
  return path.join('assets', dir, `${name}-${digest + ext}`)
}

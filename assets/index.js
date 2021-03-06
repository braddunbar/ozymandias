'use strict'

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const {promisify} = require('util')
const readFile = promisify(fs.readFile)
const {ASSET_VERSION, STATIC_ORIGIN} = process.env

let assets = {}
let integrity = {}

try {
  const manifest = JSON.parse(fs.readFileSync('public/assets/.manifest.json'))
  assets = manifest.assets
  integrity = manifest.integrity
} catch (error) { }

exports.path = (asset) => `${STATIC_ORIGIN || ''}/${assets[asset] || asset}`

exports.integrity = (path) => integrity[path] || ''

exports.version = crypto
  .createHash('sha256')
  .update(JSON.stringify(assets))
  .digest('hex')

exports.digestPath = async (asset) => {
  const {dir, name, ext} = path.parse(asset)
  const buffer = await readFile(path.join('public', asset))
  const hash = crypto.createHash('sha256').update(buffer)
  if (ASSET_VERSION) hash.update(ASSET_VERSION)
  const digest = hash.digest('hex')
  return path.join('assets', dir, `${name}-${digest + ext}`)
}

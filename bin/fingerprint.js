#!/usr/bin/env node

'use strict'

const assets = {}
const fs = require('fs')
const glob = require('glob')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

rimraf.sync('public/assets')

for (const file of glob.sync('public/{*,**}', {nodir: true})) {
  const hash = crypto
    .createHash('md5')
    .update(fs.readFileSync(file))
    .digest('hex')

  const ext = path.extname(file)
  const dir = path.dirname(file).replace(/^public\/?/, '')
  const base = path.basename(file, ext)

  const key = path.join(dir, `${base}${ext}`)
  const fingerprint = path.join(dir, `${base}-${hash}${ext}`)

  assets[key] = `/assets/${fingerprint}`
  mkdirp.sync(`public/assets/${dir}`)
  fs.createReadStream(file).pipe(
    fs.createWriteStream(`public/assets/${fingerprint}`)
  )
}

const data = JSON.stringify(assets, null, '  ')
fs.writeFileSync(path.join(__dirname, '../assets/fingerprints.json'), data)

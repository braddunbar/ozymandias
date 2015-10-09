#!/usr/bin/env node

'use strict'

let assets = {}
let fs = require('fs')
let glob = require('glob')
let path = require('path')
let crypto = require('crypto')
let mkdirp = require('mkdirp')
let rimraf = require('rimraf')

rimraf.sync('public/assets')

for (let file of glob.sync('public/{*,**}', {nodir: true})) {
  let hash = crypto
    .createHash('md5')
    .update(fs.readFileSync(file))
    .digest('hex')

  let ext = path.extname(file)
  let dir = path.dirname(file).replace(/^public\/?/, '')
  let base = path.basename(file, ext)

  let key = path.join(dir, `${base}${ext}`)
  let fingerprint = path.join(dir, `${base}-${hash}${ext}`)

  assets[key] = `/assets/${fingerprint}`
  mkdirp.sync(`public/assets/${dir}`)
  fs.createReadStream(file).pipe(
    fs.createWriteStream(`public/assets/${fingerprint}`)
  )
}

fs.writeFileSync('assets.json', JSON.stringify(assets, null, '  '))

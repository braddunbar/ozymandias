'use strict'

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')

module.exports = (publicPath) => {
  const manifest = {}
  const assetPath = path.join(publicPath, 'assets')
  const manifestPath = path.join(assetPath, '.manifest.json')

  // All public files not in assets.
  const publicFiles = glob.sync(path.join(publicPath, '**/*'), {
    ignore: path.join(assetPath, '**/*'),
    nodir: true
  }).map((file) => path.relative(publicPath, file))

  for (const file of publicFiles) {
    const buffer = fs.readFileSync(path.join(publicPath, file))
    const hash = crypto.createHash('md5').update(buffer).digest('hex')
    const dir = path.dirname(file)
    const ext = path.extname(file)
    const base = path.basename(file, ext)
    const asset = path.join('assets', dir, `${base}-${hash + ext}`)

    // Add the asset to the result.
    manifest[file] = asset

    // Ensure that public/assets/dir exists.
    mkdirp.sync(path.join(assetPath, dir))

    // Write to public/assets/dir/file-<hash>.ext
    fs.writeFileSync(path.join(publicPath, asset), buffer)
  }

  // Write out the manifest.
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))

  return manifest
}

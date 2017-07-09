'use strict'

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const {digestPath} = require('./assets')

module.exports = async () => {
  let manifest = {}
  const assetPath = 'public/assets'
  const manifestPath = path.join(assetPath, '.manifest.json')

  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath))
  } catch (error) { }

  // asset paths
  const assets = manifest.assets = {}
  const integrity = manifest.integrity = {}
  const files = manifest.files || (manifest.files = {})

  // Bump ages
  for (const file of Object.keys(files)) files[file].age += 1

  // All public files not in assets.
  const publicAssets = glob.sync(path.join('public/**/*'), {
    ignore: path.join(assetPath, '**/*'),
    nodir: true
  }).map((file) => path.relative('public', file))

  for (const asset of publicAssets) {
    const buffer = fs.readFileSync(path.join('public', asset))
    const base64 = crypto.createHash('sha256').update(buffer).digest('base64')
    const {dir, ext} = path.parse(asset)
    const file = digestPath(asset)

    // Add to assets.
    assets[asset] = file

    // Add to integrity.
    if (ext === '.js' || ext === '.css') integrity[asset] = `sha256-${base64}`

    // Add to files and reset age.
    if (!files[file]) files[file] = {age: 0, asset}
    files[file].age = 0

    // Ensure that public/assets/dir exists.
    mkdirp.sync(path.join(assetPath, dir))

    // Write to public/assets/dir/file-<hash>.ext
    fs.writeFileSync(path.join('public', file), buffer)
  }

  // Remove old files from manifest.
  for (const file of Object.keys(files)) {
    if (files[file].age > 2) delete files[file]
  }

  // Delete old files.
  for (let file of glob.sync(path.join(assetPath, '**/*'), {nodir: true})) {
    if (!files[path.relative('public', file)]) fs.unlinkSync(file)
  }

  // Delete empty directories.
  for (let dir of glob.sync(path.join(assetPath, '**/*/'))) {
    try { fs.rmdirSync(dir) } catch (error) { }
  }

  // Write out the manifest.
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))

  return manifest
}

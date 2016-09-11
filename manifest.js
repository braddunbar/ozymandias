'use strict'

const fs = require('fs')
const glob = require('glob')
const path = require('path')
const crypto = require('crypto')
const mkdirp = require('mkdirp')

module.exports = (publicPath) => {
  let manifest = {}
  const assetPath = path.join(publicPath, 'assets')
  const manifestPath = path.join(assetPath, '.manifest.json')

  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath))
  } catch (error) { }

  // asset paths
  const assets = manifest.assets = {}
  const files = manifest.files || (manifest.files = {})

  // Bump ages
  for (const file of Object.keys(files)) files[file].age += 1

  // All public files not in assets.
  const publicAssets = glob.sync(path.join(publicPath, '**/*'), {
    ignore: path.join(assetPath, '**/*'),
    nodir: true
  }).map((file) => path.relative(publicPath, file))

  for (const asset of publicAssets) {
    const buffer = fs.readFileSync(path.join(publicPath, asset))
    const hash = crypto.createHash('md5').update(buffer).digest('hex')
    const dir = path.dirname(asset)
    const ext = path.extname(asset)
    const base = path.basename(asset, ext)
    const file = path.join('assets', dir, `${base}-${hash + ext}`)

    // Add to assets.
    assets[asset] = file

    // Add to files and reset age.
    if (!files[file]) files[file] = {age: 0, asset}
    files[file].age = 0

    // Ensure that public/assets/dir exists.
    mkdirp.sync(path.join(assetPath, dir))

    // Write to public/assets/dir/file-<hash>.ext
    fs.writeFileSync(path.join(publicPath, file), buffer)
  }

  // Remove old files from manifest.
  for (const file of Object.keys(files)) {
    if (files[file].age > 2) delete files[file]
  }

  // Delete old files.
  for (let file of glob.sync(path.join(assetPath, '**/*'), {nodir: true})) {
    if (!files[path.relative(publicPath, file)]) fs.unlinkSync(file)
  }

  // Delete empty directories.
  for (let dir of glob.sync(path.join(assetPath, '**/*/'))) {
    try { fs.rmdirSync(dir) } catch (error) { }
  }

  // Write out the manifest.
  fs.writeFileSync(manifestPath, JSON.stringify(manifest))

  return manifest
}

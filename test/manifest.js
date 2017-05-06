'use strict'

const fs = require('fs')
const test = require('./test')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const manifest = require('../manifest')

const hex = (value) => (
  crypto.createHash('sha256').update(value).digest('hex')
)

const base64 = (value) => (
  crypto.createHash('sha256').update(value).digest('base64')
)

test('set up', async (assert) => {
  mkdirp.sync('public')
})

test('hash files and return the asset path', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test', '1')
  assert.deepEqual(manifest(), {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}}
  })
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}`).toString(), '1')
})

test('js files are added to integrity', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test.js', '1')
  assert.deepEqual(manifest(), {
    assets: {'test.js': `assets/test-${hex('1')}.js`},
    integrity: {'test.js': `sha256-${base64('1')}`},
    files: {[`assets/test-${hex('1')}.js`]: {age: 0, asset: 'test.js'}}
  })
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}.js`).toString(), '1')
})

test('css files are added to integrity', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test.css', '1')
  assert.deepEqual(manifest(), {
    assets: {'test.css': `assets/test-${hex('1')}.css`},
    integrity: {'test.css': `sha256-${base64('1')}`},
    files: {[`assets/test-${hex('1')}.css`]: {age: 0, asset: 'test.css'}}
  })
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}.css`).toString(), '1')
})

test('do not bump age on multiple runs', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test', '1')
  manifest()
  manifest()
  manifest()
  manifest()
  assert.deepEqual(manifest(), {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}}
  })
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}`).toString(), '1')
})

test('write out .manifest.json', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test', '1')
  manifest()
  const result = JSON.parse(fs.readFileSync('public/assets/.manifest.json'))
  assert.deepEqual(result, {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}}
  })
})

test('handle file extensions correctly', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test.txt', '1')
  assert.deepEqual(manifest(), {
    assets: {'test.txt': `assets/test-${hex('1')}.txt`},
    integrity: {},
    files: {[`assets/test-${hex('1')}.txt`]: {age: 0, asset: 'test.txt'}}
  })
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}.txt`).toString(), '1')
})

test('handle directories correctly', async (assert) => {
  rimraf.sync('public/**/*')
  mkdirp.sync('public/test')
  fs.writeFileSync('public/test/test', '1')
  assert.deepEqual(manifest(), {
    assets: {'test/test': `assets/test/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test/test-${hex('1')}`]: {age: 0, asset: 'test/test'}}
  })
  assert.is(fs.readFileSync(`public/assets/test/test-${hex('1')}`).toString(), '1')
})

test('ignore files and directories in public/assets/', async (assert) => {
  rimraf.sync('public/**/*')
  mkdirp.sync('public/assets/test/test')
  fs.writeFileSync('public/assets/test/test/test', '1')
  assert.deepEqual(manifest(), {assets: {}, files: {}, integrity: {}})
})

test('read existing manifest', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test', '1')
  manifest()
  fs.writeFileSync('public/test', '2')
  assert.deepEqual(manifest(), {
    assets: {test: `assets/test-${hex('2')}`},
    integrity: {},
    files: {
      [`assets/test-${hex('1')}`]: {age: 1, asset: 'test'},
      [`assets/test-${hex('2')}`]: {age: 0, asset: 'test'}
    }
  })
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}`).toString(), '1')
  assert.is(fs.readFileSync(`public/assets/test-${hex('2')}`).toString(), '2')
})

test('only keep three versions', async (assert) => {
  rimraf.sync('public/**/*')
  fs.writeFileSync('public/test', '1')
  manifest()
  fs.writeFileSync('public/test', '2')
  manifest()
  fs.writeFileSync('public/test', '3')
  manifest()
  fs.writeFileSync('public/test', '4')
  assert.deepEqual(manifest(), {
    assets: {test: `assets/test-${hex('4')}`},
    integrity: {},
    files: {
      [`assets/test-${hex('2')}`]: {age: 2, asset: 'test'},
      [`assets/test-${hex('3')}`]: {age: 1, asset: 'test'},
      [`assets/test-${hex('4')}`]: {age: 0, asset: 'test'}
    }
  })
  assert.ok(!fs.existsSync(`public/assets/test-${hex('1')}`))
  assert.is(fs.readFileSync(`public/assets/test-${hex('2')}`).toString(), '2')
  assert.is(fs.readFileSync(`public/assets/test-${hex('3')}`).toString(), '3')
  assert.is(fs.readFileSync(`public/assets/test-${hex('4')}`).toString(), '4')
})

test('remove empty directories', async (assert) => {
  rimraf.sync('public/**/*')
  mkdirp.sync('public/dir')
  fs.writeFileSync('public/dir/test', '1')
  manifest()
  fs.rename('public/dir/test', 'public/test')
  manifest()
  manifest()
  assert.deepEqual(manifest(), {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {
      [`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}
    }
  })
  assert.ok(!fs.existsSync(`public/assets/dir`))
  assert.is(fs.readFileSync(`public/assets/test-${hex('1')}`).toString(), '1')
})

test('clean up', async (assert) => {
  rimraf.sync('public')
})

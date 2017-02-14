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

test('set up', function *(t) {
  mkdirp.sync('test/public')
})

test('hash files and return the asset path', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}`).toString(), '1')
})

test('js files are added to integrity', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test.js', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {'test.js': `assets/test-${hex('1')}.js`},
    integrity: {'test.js': `sha256-${base64('1')}`},
    files: {[`assets/test-${hex('1')}.js`]: {age: 0, asset: 'test.js'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}.js`).toString(), '1')
})

test('css files are added to integrity', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test.css', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {'test.css': `assets/test-${hex('1')}.css`},
    integrity: {'test.css': `sha256-${base64('1')}`},
    files: {[`assets/test-${hex('1')}.css`]: {age: 0, asset: 'test.css'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}.css`).toString(), '1')
})

test('do not bump age on multiple runs', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  manifest('test/public')
  manifest('test/public')
  manifest('test/public')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}`).toString(), '1')
})

test('write out .manifest.json', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  const result = JSON.parse(fs.readFileSync('test/public/assets/.manifest.json'))
  t.deepEqual(result, {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}}
  })
})

test('handle file extensions correctly', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test.txt', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {'test.txt': `assets/test-${hex('1')}.txt`},
    integrity: {},
    files: {[`assets/test-${hex('1')}.txt`]: {age: 0, asset: 'test.txt'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}.txt`).toString(), '1')
})

test('handle directories correctly', function *(t) {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/test')
  fs.writeFileSync('test/public/test/test', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {'test/test': `assets/test/test-${hex('1')}`},
    integrity: {},
    files: {[`assets/test/test-${hex('1')}`]: {age: 0, asset: 'test/test'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test/test-${hex('1')}`).toString(), '1')
})

test('ignore files and directories in public/assets/', function *(t) {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/assets/test/test')
  fs.writeFileSync('test/public/assets/test/test/test', '1')
  t.deepEqual(manifest('test/public'), {assets: {}, files: {}, integrity: {}})
})

test('read existing manifest', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '2')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${hex('2')}`},
    integrity: {},
    files: {
      [`assets/test-${hex('1')}`]: {age: 1, asset: 'test'},
      [`assets/test-${hex('2')}`]: {age: 0, asset: 'test'}
    }
  })
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}`).toString(), '1')
  t.is(fs.readFileSync(`test/public/assets/test-${hex('2')}`).toString(), '2')
})

test('only keep three versions', function *(t) {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '2')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '3')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '4')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${hex('4')}`},
    integrity: {},
    files: {
      [`assets/test-${hex('2')}`]: {age: 2, asset: 'test'},
      [`assets/test-${hex('3')}`]: {age: 1, asset: 'test'},
      [`assets/test-${hex('4')}`]: {age: 0, asset: 'test'}
    }
  })
  t.ok(!fs.existsSync(`test/public/assets/test-${hex('1')}`))
  t.is(fs.readFileSync(`test/public/assets/test-${hex('2')}`).toString(), '2')
  t.is(fs.readFileSync(`test/public/assets/test-${hex('3')}`).toString(), '3')
  t.is(fs.readFileSync(`test/public/assets/test-${hex('4')}`).toString(), '4')
})

test('remove empty directories', function *(t) {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/dir')
  fs.writeFileSync('test/public/dir/test', '1')
  manifest('test/public')
  fs.rename('test/public/dir/test', 'test/public/test')
  manifest('test/public')
  manifest('test/public')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${hex('1')}`},
    integrity: {},
    files: {
      [`assets/test-${hex('1')}`]: {age: 0, asset: 'test'}
    }
  })
  t.ok(!fs.existsSync(`test/public/assets/dir`))
  t.is(fs.readFileSync(`test/public/assets/test-${hex('1')}`).toString(), '1')
})

test('clean up', function *(t) {
  rimraf.sync('test/public')
})

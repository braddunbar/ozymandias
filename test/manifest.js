'use strict'

const fs = require('fs')
const test = require('tape')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const manifest = require('../manifest')

const ONE = 'c4ca4238a0b923820dcc509a6f75849b'

test('set up', (t) => {
  mkdirp.sync('test/public')
  t.end()
})

test('hash files and return the asset path', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  t.deepEqual(manifest('test/public'), {
    test: `assets/test-${ONE}`
  })
  t.is(fs.readFileSync(`test/public/assets/test-${ONE}`).toString(), '1')
  t.end()
})

test('write out .manifest.json', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  const result = JSON.parse(fs.readFileSync('test/public/assets/.manifest.json'))
  t.deepEqual(result, {
    test: `assets/test-${ONE}`
  })
  t.end()
})

test('handle file extensions correctly', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test.txt', '1')
  t.deepEqual(manifest('test/public'), {
    'test.txt': `assets/test-${ONE}.txt`
  })
  t.is(fs.readFileSync(`test/public/assets/test-${ONE}.txt`).toString(), '1')
  t.end()
})

test('handle directories correctly', (t) => {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/test')
  fs.writeFileSync('test/public/test/test', '1')
  t.deepEqual(manifest('test/public'), {
    'test/test': `assets/test/test-${ONE}`
  })
  t.is(fs.readFileSync(`test/public/assets/test/test-${ONE}`).toString(), '1')
  t.end()
})

test('ignore files and directories in public/assets/', (t) => {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/assets/test/test')
  fs.writeFileSync('test/public/assets/test/test/test', '1')
  t.deepEqual(manifest('test/public'), {})
  t.end()
})

test('clean up', (t) => {
  rimraf.sync('test/public')
  t.end()
})

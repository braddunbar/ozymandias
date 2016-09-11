'use strict'

const fs = require('fs')
const test = require('tape')
const crypto = require('crypto')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const manifest = require('../manifest')

const hash = (value) => crypto.createHash('md5').update(value).digest('hex')

const ONE = hash('1')
const TWO = hash('2')
const THREE = hash('3')
const FOUR = hash('4')

test('set up', (t) => {
  mkdirp.sync('test/public')
  t.end()
})

test('hash files and return the asset path', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${ONE}`},
    files: {[`assets/test-${ONE}`]: {age: 0, asset: 'test'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${ONE}`).toString(), '1')
  t.end()
})

test('do not bump age on multiple runs', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  manifest('test/public')
  manifest('test/public')
  manifest('test/public')
  t.deepEqual(manifest('test/public'), {
    assets: {test: `assets/test-${ONE}`},
    files: {[`assets/test-${ONE}`]: {age: 0, asset: 'test'}}
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
    assets: {test: `assets/test-${ONE}`},
    files: {[`assets/test-${ONE}`]: {age: 0, asset: 'test'}}
  })
  t.end()
})

test('handle file extensions correctly', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test.txt', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {'test.txt': `assets/test-${ONE}.txt`},
    files: {[`assets/test-${ONE}.txt`]: {age: 0, asset: 'test.txt'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test-${ONE}.txt`).toString(), '1')
  t.end()
})

test('handle directories correctly', (t) => {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/test')
  fs.writeFileSync('test/public/test/test', '1')
  t.deepEqual(manifest('test/public'), {
    assets: {'test/test': `assets/test/test-${ONE}`},
    files: {[`assets/test/test-${ONE}`]: {age: 0, asset: 'test/test'}}
  })
  t.is(fs.readFileSync(`test/public/assets/test/test-${ONE}`).toString(), '1')
  t.end()
})

test('ignore files and directories in public/assets/', (t) => {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/assets/test/test')
  fs.writeFileSync('test/public/assets/test/test/test', '1')
  t.deepEqual(manifest('test/public'), {assets: {}, files: {}})
  t.end()
})

test('read existing manifest', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '2')
  t.deepEqual(manifest('test/public'), {
    assets: {'test': `assets/test-${TWO}`},
    files: {
      [`assets/test-${ONE}`]: {age: 1, asset: 'test'},
      [`assets/test-${TWO}`]: {age: 0, asset: 'test'}
    }
  })
  t.is(fs.readFileSync(`test/public/assets/test-${ONE}`).toString(), '1')
  t.is(fs.readFileSync(`test/public/assets/test-${TWO}`).toString(), '2')
  t.end()
})

test('only keep three versions', (t) => {
  rimraf.sync('test/public/**/*')
  fs.writeFileSync('test/public/test', '1')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '2')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '3')
  manifest('test/public')
  fs.writeFileSync('test/public/test', '4')
  t.deepEqual(manifest('test/public'), {
    assets: {'test': `assets/test-${FOUR}`},
    files: {
      [`assets/test-${TWO}`]: {age: 2, asset: 'test'},
      [`assets/test-${THREE}`]: {age: 1, asset: 'test'},
      [`assets/test-${FOUR}`]: {age: 0, asset: 'test'}
    }
  })
  t.ok(!fs.existsSync(`test/public/assets/test-${ONE}`))
  t.is(fs.readFileSync(`test/public/assets/test-${TWO}`).toString(), '2')
  t.is(fs.readFileSync(`test/public/assets/test-${THREE}`).toString(), '3')
  t.is(fs.readFileSync(`test/public/assets/test-${FOUR}`).toString(), '4')
  t.end()
})

test('remove empty directories', (t) => {
  rimraf.sync('test/public/**/*')
  mkdirp.sync('test/public/dir')
  fs.writeFileSync('test/public/dir/test', '1')
  manifest('test/public')
  fs.rename('test/public/dir/test', 'test/public/test')
  manifest('test/public')
  manifest('test/public')
  t.deepEqual(manifest('test/public'), {
    assets: {'test': `assets/test-${ONE}`},
    files: {
      [`assets/test-${ONE}`]: {age: 0, asset: 'test'}
    }
  })
  t.ok(!fs.existsSync(`test/public/assets/dir`))
  t.is(fs.readFileSync(`test/public/assets/test-${ONE}`).toString(), '1')
  t.end()
})

test('clean up', (t) => {
  rimraf.sync('test/public')
  t.end()
})

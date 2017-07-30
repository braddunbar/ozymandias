'use strict'

const fs = require('fs')
const test = require('./test')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const rollup = require('../rollup')

test('setup', async () => {
  mkdirp.sync('tmp/test')
  mkdirp.sync('public')
  process.env.TEST = 'x'
})

test('rollup some files', async ({assert}) => {
  fs.writeFileSync('tmp/test/a.js', 'export const x = 1')
  fs.writeFileSync('tmp/test/b.js', "import {x} from './a'; console.log(x)")
  assert.is(await rollup('tmp/test/b.js'), "'use strict';\n\nvar x = 1;\n\nconsole.log(x);\n")
})

test('rollup with environment variables', async ({assert}) => {
  fs.writeFileSync('tmp/test/a.js', "import value from 'env:TEST'; console.log(value)")
  assert.is(await rollup('tmp/test/a.js'), "'use strict';\n\nvar value = 'x';\n\nconsole.log(value);\n")
})

test('rollup with public assets', async ({assert}) => {
  fs.writeFileSync('tmp/test/a.js', "import path from 'public/asset.txt'; console.log(path)")
  fs.writeFileSync('public/asset.txt', '1')
  assert.is(await rollup('tmp/test/a.js'), "'use strict';\n\nvar path = '/assets/asset-6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b.txt';\n\nconsole.log(path);\n")
})

test('teardown', async () => {
  rimraf.sync('tmp/test')
  rimraf.sync('public')
  delete process.env.TEST
})

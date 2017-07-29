'use strict'

const fs = require('fs')
const test = require('./test')
const sass = require('../sass')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')

test('set up', async () => {
  mkdirp.sync('tmp/test')
  mkdirp.sync('public')
})

test('render sass', async ({assert}) => {
  fs.writeFileSync('tmp/test/a.sass', "@import 'b'; a { color: blue; }")
  fs.writeFileSync('tmp/test/b.sass', 'b { color: black; }')
  assert.is(await sass('tmp/test/a.sass'), 'b{color:black}a{color:blue}\n')
})

test('render an asset path', async ({assert}) => {
  fs.writeFileSync('public/test.txt', 'test')
  fs.writeFileSync('tmp/test/assets.sass', "div { background-image: asset-path('test.txt'); }")
  assert.is(await sass('tmp/test/assets.sass'), "div{background-image:url('/assets/test-9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08.txt')}\n")
})

test('tear down', async () => {
  rimraf.sync('tmp/test')
  rimraf.sync('public')
})

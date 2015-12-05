'use strict'

let pg = require('pg')
let tape = require('tape')

require('./body')
require('./db')
require('./find')
require('./helpers')
require('./layout')
require('./mail')
require('./secure')
require('./token')
require('./user')

tape('teardown', function (t) {
  pg.end()
  t.end()
})

'use strict'

const pg = require('pg')
const tape = require('tape')

require('./body')
require('./db')
require('./find')
require('./helpers')
require('./layout')
require('./mail')
require('./secure')
require('./token')
require('./user')

tape('teardown', (t) => {
  pg.end()
  t.end()
})

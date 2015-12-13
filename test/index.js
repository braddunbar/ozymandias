'use strict'

const pg = require('pg')
const tape = require('tape')

require('./auth')
require('./body')
require('./db')
require('./find')
require('./flash')
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

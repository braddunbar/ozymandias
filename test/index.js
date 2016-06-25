'use strict'

const pg = require('pg')
const tape = require('tape')

require('./auth')
require('./body')
require('./db')
require('./find')
require('./flash')
require('./helpers')
require('./html')
require('./layout')
require('./mail')
require('./secure')
require('./token')
require('./user')
require('./react')
require('./render')

tape('teardown', (t) => {
  pg.end()
  t.end()
})

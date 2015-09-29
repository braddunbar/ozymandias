'use strict'

let pg = require('pg')
let tape = require('tape')

require('./db')
require('./helpers')
require('./layout')
require('./mail')

tape('teardown', function (t) {
  pg.end()
  t.end()
})

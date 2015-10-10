'use strict'

let pg = require('pg')
let tape = require('tape')

require('./body')
require('./db')
require('./helpers')
require('./layout')
require('./mail')

tape('teardown', function (t) {
  pg.end()
  t.end()
})

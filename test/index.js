var pg = require('pg')
var test = require('tape')

require('./helpers')
require('./layout')
require('./mail')
require('./db')

test('teardown', function (t) {
  pg.end()
  t.end()
})

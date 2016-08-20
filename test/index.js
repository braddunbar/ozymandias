'use strict'

const db = require('../db/instance')
const tape = require('tape')

require('./body')
require('./current-user')
require('./db')
require('./find')
require('./helpers')
require('./html')
require('./json')
require('./mail')
require('./secure')
require('./token')
require('./user')
require('./react')
require('./render')

tape('teardown', (t) => {
  db.close()
  t.end()
})

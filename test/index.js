'use strict'

const db = require('../db/instance')
const tape = require('tape')

require('./body')
require('./current-user')
require('./db')
require('./helpers')
require('./html')
require('./mail')
require('./manifest')
require('./secure')
require('./token')
require('./user')
require('./react')
require('./session')
require('./vary')

tape('teardown', (t) => {
  db.close()
  t.end()
})

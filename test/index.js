'use strict'

const db = require('../db/instance')
const test = require('./test')

require('./body')
require('./current-user')
require('./db')
require('./helpers')
require('./html')
require('./mail')
require('./manifest')
require('./security')
require('./token')
require('./user')
require('./react')
require('./session')
require('./vary')

test('teardown', function *(t) {
  db.close()
})

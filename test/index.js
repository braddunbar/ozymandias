'use strict'

const db = require('../db/instance')
const test = require('./test')

require('./body')
require('./browser')
require('./cache-control')
require('./current-user')
require('./db')
require('./helpers')
require('./html')
require('./mail')
require('./manifest')
require('./migrate')
require('./security')
require('./token')
require('./user')
require('./react')
require('./section')
require('./session')
require('./vary')

test('teardown', async ({browser}) => {
  browser.quit()
  db.close()
})

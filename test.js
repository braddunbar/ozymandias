'use strict'

const co = require('co')
const ozy = require('./')
const db = require('./db/instance')
const tape = require('tape')
const Client = require('test-client')

module.exports = function (name, test) {
  tape(name, (t) => co(function *() {
    const app = t.app = ozy()

    for (const route of require('./session')) app.use(route)

    // Default client.
    app.context.client = () => null

    // Set up transactions.
    const transaction = db.transaction()
    db.query = transaction.query.bind(transaction)

    const client = new Client(app)

    try {
      yield test(t, {app, client})
    } finally {
      yield transaction.rollback()
    }

    t.end()
  })
  .catch((error) => t.end(error)))
}

'use strict'

const db = require('./db/instance')
const tape = require('tape')
const query = db.query

module.exports = function (name, test) {
  tape(name, (t) => {
    // Set up transactions.
    const transaction = db.transaction()
    db.query = transaction.query.bind(transaction)

    // Rollback the transaction before ending the test.
    const end = t.end.bind(t)
    t.end = (...args) => {
      transaction.rollback()
        .then(() => end(...args))
        .catch(() => end(...args))
      db.query = query
    }

    test(t)
  })
}

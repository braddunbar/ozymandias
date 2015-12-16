'use strict'

const db = require('./db/instance')
const tape = require('tape')
const query = db.query

exports = module.exports = function (name, test) {
  tape(name, (t) => {
    // Set up transactions.
    const transaction = db.transaction()
    db.query = transaction.query.bind(transaction)

    // Rollback the transaction before ending the test.
    const end = t.end
    t.end = function () {
      const args = arguments
      const next = () => end.apply(t, args)
      transaction.rollback().then(next).catch(next)
      db.query = query
    }

    test(t)
  })
}

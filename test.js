'use strict'

const app = require('./')()
const db = require('./db/instance')
const tape = require('tape')
const query = db.query
const request = require('supertest')

module.exports = function (name, test) {
  tape(name, (t) => {
    t.agent = request.agent(app)

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

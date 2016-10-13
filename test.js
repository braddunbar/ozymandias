'use strict'

const ozy = require('./')
const http = require('http')
const db = require('./db/instance')
const tape = require('tape')
const query = db.query
const request = require('supertest')

module.exports = function (name, test) {
  tape(name, (t) => {
    const app = t.app = ozy()

    // Default client.
    app.context.client = () => null

    // Supertest!
    t.agent = request.agent(http.createServer(app.callback()))

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

'use strict'

const co = require('co')
const ozy = require('./')
const http = require('http')
const db = require('./db/instance')
const tape = require('tape')
const query = db.query
const request = require('supertest')
const Client = require('test-client')

module.exports = function (name, test) {
  tape(name, (t) => {
    const app = t.app = ozy()

    for (const route of require('./session')) app.use(route)

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

    const client = new Client(app)

    co(test, t, {app, client}).catch((error) => {
      t.end(error)
    })
  })
}

'use strict'

const ozy = require('./')
const db = require('./db/instance')
const tape = require('tape')
const Client = require('test-client')

module.exports = (name, test) => tape(name, async (t) => {
  const app = t.app = ozy()

  for (const route of require('./session')) app.use(route)

  // Default client.
  app.context.client = () => null

  // Set up transactions.
  const transaction = db.transaction()
  db.query = transaction.query.bind(transaction)

  const client = new Client(app)

  try {
    await test(t, {app, client})
    t.end()
  } catch (error) {
    t.end(error)
  } finally {
    transaction.rollback()
  }
})

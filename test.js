'use strict'

const db = require('./db/instance')
const tape = require('tape')
const Client = require('test-client')

module.exports = (App) => (name, test) => tape(name, async (assert) => {
  const app = App()

  for (const route of require('./session')) app.use(route)

  // Default client.
  app.context.client = () => null

  // Set up transactions.
  const transaction = db.transaction()
  db.query = transaction.query.bind(transaction)

  const client = new Client(app)

  try {
    await test({app, assert, client})
    assert.end()
  } catch (error) {
    assert.end(error)
  } finally {
    transaction.rollback()
  }
})

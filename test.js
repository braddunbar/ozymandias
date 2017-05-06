'use strict'

const db = require('./db/instance')
const tape = require('tape')
const Client = require('test-client')
const Browser = require('./test/browser')

module.exports = (App) => (name, test) => tape(name, async (assert) => {
  const app = App()
  const browser = new Browser(app)

  // Set up transactions.
  const transaction = db.transaction()
  db.query = transaction.query.bind(transaction)

  const client = new Client(app)

  client.signIn = (email) => (
    client.post('/session').send({email, password: 'secret'})
  )

  try {
    await test({app, assert, browser, client})
    assert.end()
  } catch (error) {
    assert.end(error)
  } finally {
    browser.close()
    transaction.rollback()
  }
})
